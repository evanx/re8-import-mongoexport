module.exports = {
    description: 'Containerizable utility to import mongoexport file into Redis.',
    required: {
        redisHost: {
            description: 'the Redis host',
            example: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        idKey: {
            description: 'the ID key',
            example: 'placeId'
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
            example: 're8-import:busy:q'
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
    },
    test: {
        loggerLevel: 'info'
    },
    development: {
        loggerLevel: 'debug'
    }
}
