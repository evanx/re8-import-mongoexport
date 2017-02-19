
# reimport

Containerizable utility to import Mongo data into Redis.

<img src="https://raw.githubusercontent.com/evanx/reimport/master/docs/readme/main.png"/>

## Use case

We use `mongoexport` to export a collection from MongoDB into a file, where each line is a JSON object.

We stream each line into a Redis list using https://github.com/evanx/resplit

This service then pops each line, extracts a required unique ID field for the Redis key, and sets the JSON document in Redis according to a Redis key template with `{id}`

For example we have `place_id` in the JSON object, and wish to store the document using the key `place:${id}:json`

This JSON is intended to be exported to disk using https://github.com/evanx/re8, and served using Nginx.


## Config spec

See `lib/spec.js` https://github.com/evanx/reimport/blob/master/lib/spec.js
```javascript
module.exports = {
    description: 'Containerizable utility to import mongoexport file into Redis.',
    required: {
        redisHost: {
            description: 'the Redis host',
            default: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        idKey: {
            description: 'the ID key',
            example: 'place_id'
        },
        keyTemplate: {
            description: 'the Redis key template',
            example: 'place:{id}:json'
        },
        inq: {
            description: 'the queue to import',
            example: 'resplit:q'
        },
        busyq: {
            description: 'the pending list for brpoplpush',
            example: 'reimport:busy:q'
        },
        outq: {
            description: 'the output key queue',
            example: 're8:key:q'
        },
        popTimeout: {
            description: 'the timeout for brpoplpush',
            unit: 'seconds',
            default: 10
        },
        loggerLevel: {
            description: 'the logging level',
            default: 'info',
            example: 'debug'
        }
    }
}
```

### Appication archetype

Incidently `lib/index.js` uses the `redis-app-rpf` application archetype.
```
require('redis-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

This provides lifecycle boilerplate reused across similar applications.

See https://github.com/evanx/redis-app-rpf


## Docker

You can build as follows:
```
docker build -t reimport https://github.com/evanx/reimport.git
```
using https://github.com/evanx/reimport/blob/master/Dockerfile

```
FROM node:7.5.0
ADD package.json .
RUN npm install
ADD lib lib
ENV NODE_ENV production
CMD ["node", "--harmony", "lib/index.js"]
```

See `test/demo.sh` https://github.com/evanx/reimport/blob/master/test/demo.sh

Builds:
- isolated network `reimport-network`
- isolated Redis instance named `reimport-redis`
- this utility as `reimport-instance`

#### Isolated test network

First we create the isolated network:
```shell
docker network create -d bridge reimport-network
```

#### Disposable Redis instance

Then the Redis container on that network:
```
redisContainer=`docker run --network=reimport-network \
    --name $redisName -d redis`
redisHost=`docker inspect $redisContainer |
    grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
```
where we parse its IP number into `redisHost`

#### Setup test data

We push an item to the input queue:
```
redis-cli lpush resplit:q '{
  "place_id": "ChIJV3iUI-PPdkgRGA7v4bhZPlU",
  "formatted_address": "Blenheim Palace, Woodstock OX20 1PP, UK"
}'
```

#### Build and run

We build a container image for this service:
```
docker build -t reimport https://github.com/evanx/reimport.git
```

We interactively run the service on our test Redis container:
```
docker build -t reimport https://github.com/evanx/reimport.git
docker run --name reimport-instance --rm -i \
  --network=reimport-network \
  -e redisHost=$redisHost \
  -e idKey=place_id \
  -e keyTemplate=place:{id}:json \
  -e inq=resplit:q \
  -e busyq=busy:q \
  -e outq=re8:key:q \
  reimport
```

#### Verify results

We check the lengths of the various queues:
```
redis-cli -h $redisHost llen resplit:q | grep ^0$
redis-cli -h $redisHost llen busy:q | grep ^0$
redis-cli -h $redisHost llen re8:key:q | grep ^1$
```

We check that the key is pushed to the output queue:
```
redis-cli -h $redisHost lindex re8:key:q 0
```

```
evan@dijkstra:~/reimport$ sh test/demo.sh
...
```

#### Teardown

```
docker rm -f reimport-redis
docker network rm reimport-network
```

## Implementation

See `lib/main.js`

```javascript
while (true) {
    logger.debug('brpoplpush', config.inq, config.busyq, config.popTimeout);
    const item = await client.brpoplpushAsync(config.inq, config.busyq, config.popTimeout);
    logger.debug('popped', config.inq, config.busyq, item);
    if (!item) {
        break;
    }
    if (item === 'exit') {
        await client.lrem(config.busyq, 1, item);
        break;
    }
    const object = JSON.parse(item);
    const id = object[config.idKey];
    asserto({id});
    const key = config.keyTemplate.replace(/{id}/, id);
    logger.debug({id, key});
    await multiExecAsync(client, multi => {
        multi.set(key, item);
        multi.lpush(config.outq, key);
        multi.lrem(config.busyq, 1, item);
    });
}
```

### Appication archetype

Incidently `lib/index.js` uses the `redis-app-rpf` application archetype.
```
require('redis-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

This provides lifecycle boilerplate to reuse across similar applications.

See https://github.com/evanx/redis-app-rpf.

<hr>
https://twitter.com/@evanxsummers
