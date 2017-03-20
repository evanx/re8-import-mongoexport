module.exports = {
    description: 'Containerizable utility to import JSON into Redis.',
    required: {
        redisHost: {
            description: 'the Redis host',
            example: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        idName: {
            description: 'the ID property name',
            example: 'place_id'
        },
        redisNamespace: {
            description: 'the Redis key namespace',
            example: 'reimport'
        },
        idNamespace: {
            description: 'the Redis key namespace for ID',
            example: 'place'
        },
        inQ: {
            description: 'the queue to import',
            example: 'resplit:q'
        },
        busyQ: {
            description: 'the pending list for brpoplpush',
            example: 'reimport:busy:q'
        },
        idQ: {
            description: 'the output queue',
            example: 'reimport:out:q'
        },
        idS: {
            description: 'the output set',
            example: 'reimport:out:s'
        },
        keyQ: {
            description: 'the output key queue',
            example: 'refile:key:q'
        },
        popTimeout: {
            description: 'the timeout for brpoplpush',
            unit: 'seconds',
            default: 10
        },
        loggerLevel: {
            description: 'the logging level',
            example: 'debug',
            default: 'info'
        }
    },
    test: {
        loggerLevel: 'info'
    },
    development: {
        loggerLevel: 'debug'
    }
}
