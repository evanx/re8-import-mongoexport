
# re8-import-mongoexport

Containerizable utility to import Mongo data into Redis.

## Use case

We use `mongoexport` to export a collection from MongoDB into a file, where each line is a JSON object.

We stream each line into a Redis list using https://github.com/evanx/line-lpush

This service then pops each line, extracts the primary key field, and sets in Redis.

For example we have `placeId` in the JSON object, and wish to store the document using the key `place:${placeId}:json`

## Config spec

See `lib/spec.js` https://github.com/evanx/re8-import-mongoexport/blob/master/lib/spec.js
```javascript

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
docker build -t re8-import-mongoexport https://github.com/evanx/re8-import-mongoexport.git
```
using https://github.com/evanx/re8-import-mongoexport/blob/master/Dockerfile

```
FROM node:7.5.0
ADD package.json .
RUN npm install
ADD lib lib
ENV NODE_ENV production
CMD ["node", "--harmony", "lib/index.js"]
```

<hr>
https://twitter.com/@evanxsummers
