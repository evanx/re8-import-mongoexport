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
        redisNamespace: {
            description: 'the Redis namespace'
        },
        highLength: {
            description: 'the length of the list for back-pressure',
            default: 500
        },
        delayMillis: {
            description: 'the delay duration in milliseconds when back-pressure',
            unit: 'ms',
            default: 5000
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
