
module.exports = async context => {
    const {config, logger, client} = context;
    Object.assign(global, context);
    try {
        while (true) {
            const item = await client.brpoplpushAsync(config.inq, config.busyq, config.popTimeout);
            //logger.debug('popped', config.inq, config.busyq);
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
                await client.lrem(config.busyq, 1, item);
                break;
            }
            const object = JSON.parse(item);
            const id = object[config.idName];
            asserto({id});
            const key = [config.namespace, id, 'json'].join(':');
            logger.some('id', id, key, config.outq, item.length);
            await multiExecAsync(client, multi => {
                multi.sadd([config.namespace, 's'].join(':'), id);
                multi.set(key, item);
                multi.lpush(config.outq, key);
                multi.lrem(config.busyq, 1, item);
            });
        }
    } catch (err) {
       throw err;
    } finally {
    }
};
