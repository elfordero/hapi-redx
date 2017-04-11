'use strict';

const Inert = require('inert');
const Vision = require('vision');
var swagger = {
    basePath: '/',
    documentationPath: '/'
};

let plugins = module.exports = [];


// this is where all reusable service methods are defined.
let servicePlugins = (server, options, next) => {
    return next();
};

servicePlugins.attributes = {
    name: 'service-methods',
    version: '1.0.0'
};

plugins.push({
    register: servicePlugins
});

plugins.push(require('hapi-accept-language'));
plugins.push(Inert);
plugins.push(Vision);
plugins.push({
    register: require('hapi-swagger'),
    options: swagger
});
