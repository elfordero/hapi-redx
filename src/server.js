'use strict';

const Hapi = require('hapi'),
    pino = require('pino'),
    plugins = require('./lib/plugins'),
    pretty = pino.pretty(),
  
  logger = pino({
    name: require('./../package.json').name,
  }),




    routes = require('./lib/routes');


pretty.pipe(process.stdout);

// Get config values
let host = process.env.VCAP_APP_HOST || '0.0.0.0';
let port = process.env.PORT || 1338;


const server = new Hapi.Server({});


server.connection({
    host: host,
    port: port,
    routes:{ // This is added to log a message when a cookie enters an error state. Lyle
        state: {
            parse: false, // parse and store in request.state
            failAction: 'log' // may also be 'ignore' or 'log'
        }
    }

});



server.route(routes);

// Start the server
server.register(plugins, err => {
    if(err){
        logger.error('Something bad happened while registering plugins. Exiting...');
        throw err;
    }

    server.start( () => {
        logger.info('API started at: ' + server.info.uri);
    });
});
