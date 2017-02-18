
# reo-import-mongoexport

Containerizable utility to import mongoexport file into Redis.

## Use case

## Config spec

See `lib/spec.js` https://github.com/evanx/reo-import-mongoexport/blob/master/lib/spec.js
```javascript
```

### Appication archetype

Incidently `lib/index.js` uses the `redis-util-app-rpf` application archetype.
```
require('redis-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

That archetype is embedded in the project, as it is still evolving. Also, you can find it at https://github.com/evanx/redis-util-app-rpf.

This provides lifecycle boilerplate to reuse across similar applications.

## Docker

You can build as follows:
```
docker build -t reo-import-mongoexport https://github.com/evanx/reo-import-mongoexport.git
```
from https://github.com/evanx/reo-import-mongoexport/blob/master/Dockerfile

<hr>
https://twitter.com/@evanxsummers
