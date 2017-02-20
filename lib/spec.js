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
        namespace: {
            description: 'the Redis key namespace',
            example: 'place'
        },
        inq: {
            description: 'the queue to import',
            example: 'resplit:q'
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
        busyq: {
            description: 'the pending list for brpoplpush',
            example: 'reimport:busy:q'
        },
        loggerLevel: {
            description: 'the logging level',
            default: 'info',
            example: 'debug'
        }
    },
    test: {
        loggerLevel: 'info'
    },
    development: {
        loggerLevel: 'debug'
    }
}
