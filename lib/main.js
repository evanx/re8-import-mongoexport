
module.exports = async context => {
    const {config, logger, client} = context;
    Object.assign(global, context);
    logger.info({config});
    try {
        while (true) {
            const item = await client.brpoplpushAsync(config.inQ, config.busyQ, config.popTimeout);
            logger.debug('popped', config.inQ, config.busyQ);
            if (item === null) {
                logger.info('empty');
                break;
            }
            if (item === '') {
                logger.warn('blank');
                continue;
            }
            if (item === 'exit') {
                logger.warn('exit');
                await client.lrem(config.busyQ, 1, item);
                break;
            }
            const object = JSON.parse(item);
            const id = object[config.idName];
            asserto({id});
            const key = [config.idNamespace, id, 'j'].join(':');
            logger.debug('id', id, key, config.outq, item.length);
            await multiExecAsync(client, multi => {
                multi.set(key, item);
                multi.sadd([config.idNamespace, 's'].join(':'), id);
                multi.sadd(config.idS, id);
                multi.lpush(config.idQ, id);
                multi.lpush(config.keyQ, key);
                multi.lrem(config.busyQ, 1, item);
            });
        }
    } catch (err) {
       throw err;
    } finally {
    }
};
