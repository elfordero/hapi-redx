'use strict';

const apiHandler = require('./handlers/api-handler');

let routes = [
    //healthCheck
    {method: 'POST',     path: '/api/create',                               config: apiHandler.createUser},
    {method: 'GET',     path: '/api/login',                               config: apiHandler.loginUser},
    {method: 'GET',     path: '/api/fetch',                               config: apiHandler.fetchUser},
    {method: 'POST',     path: '/api/update',                               config: apiHandler.updateUser},
    {method: 'DELETE',     path: '/api/delete',                               config: apiHandler.deleteUser}

];

module.exports = routes;
