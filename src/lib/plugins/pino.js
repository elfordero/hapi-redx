'use strict'

const pino = require('pino')

const levels = ['trace', 'debug', 'info', 'warn', 'error']
module.exports.levelTags = {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
}

const mySerializers = {
    req: function(req) {
        return {
            method: req.raw.req.method,
            url: req.raw.req.url,
        }
    },
    res: function(res) {
        return {
            status: res.statusCode,
        };
    }
};

function register(server, options, next) {
    options.serializers = options.serializers || {}
    options.serializers.req = mySerializers.req ? mySerializers.req : asReqValue
    options.serializers.res = mySerializers.res ? mySerializers.res : pino.stdSerializers.res
    options.serializers.err = mySerializers.err ? mySerializers.err : pino.stdSerializers.err

    let logger
    if (options.instance) {
        options.instance.serializers = Object.assign(options.serializers, options.instance.serializers)
        logger = options.instance
    } else {
        options.stream = options.stream || process.stdout
        let stream = options.stream || process.stdout

        if (options.prettyPrint) {
            let pretty = pino.pretty()
            pretty.pipe(stream)
            stream = pretty
        }

        logger = pino(options, stream)
    }

    const tagToLevels = Object.assign({}, module.exports.levelTags, options.tags)
    const allTags = options.allTags || 'info'

    const validTags = Object.keys(tagToLevels).filter((key) => levels.indexOf(tagToLevels[key]) < 0).length === 0
    if (!validTags || allTags && levels.indexOf(allTags) < 0) {
        return next(new Error('invalid tag levels'))
    }

    // expose logger as 'server.app.logger'
    server.app.logger = logger

    // expose logger as 'server.logger()'
    server.decorate('server', 'logger', () => logger)

    // set a logger for each request
    server.ext('onRequest', (request, reply) => {
        request.logger = logger.child({ req: request })
        reply.continue()
    })

    server.on('log', (event) => {
        logEvent(logger, event)
    })

    server.on('request', (request, event) => {
        logEvent(request.logger, event)
    })

    // log when a request completes with an error
    server.on('request-error', (request, err) => {
        request.logger.warn({
            res: request.raw.res,
            err: err
        }, 'request error')
    })

    // log when a request completes
    server.on('response', (request) => {
        const info = request.info
        request.logger.info({
            res: request.raw.res,
            responseTime: info.responded - info.received
        }, 'request completed')
    })

    server.ext('onPostStart', (s, cb) => {
        logger.info(server.info, 'server started')
        cb()
    })

    server.ext('onPostStop', (s, cb) => {
        logger.info(server.info, 'server stopped')
        cb()
    })

    next()

    function logEvent(current, event) {
        const tags = event.tags
        const data = event.data
        for (let i = 0; i < tags.length; i++) {
            let level = tagToLevels[tags[i]]
            if (level) {
                current[level]({ tags, data })
                return
            }
        }
        if (allTags) {
            current[allTags]({ tags, data })
        }
    }
}

function asReqValue(req) {
    const raw = req.raw.req
    return {
        id: req.id,
        method: raw.method,
        url: raw.url,
        headers: raw.headers,
        remoteAddress: raw.connection.remoteAddress,
        remotePort: raw.connection.remotePort
    }
}


module.exports.register = register
module.exports.register.attributes = {
    name: 'Custom HAPI PINO register',
    version: '1.0.0'
}
