
const split = require('split');
const through2 = require('through2');

const promiseDelay = delay => new Promise(resolve => setTimeout(() => resolve(), delay));

module.exports = async ({config, logger, client}) => new Promise((resolve, reject) => {
    const inputStreamDelayer = function(buf, enc, next) {
        this.push(buf);
        client.llenAsync(config.redisKey).then(llen => {
            if (llen > config.highLength) {
                promiseDelay(config.delayMillis).then(next);
            } else {
                next();
            }
        }).catch(err => this.emit('error', err));
    };
    const inputStream = (config.highLength > 0 && config.delayMillis > 0)
    ? process.stdin.pipe(through2(inputStreamDelayer))
    : process.stdin;
    inputStream.pipe(split())
    .on('error', err => reject(err))
    .on('data', line => client.lpushAsync(config.redisKey, line)
    .catch(err => reject(err)))
    .on('end', () => resolve());
});
