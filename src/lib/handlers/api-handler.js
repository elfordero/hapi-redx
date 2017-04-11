'use strict';
let joi = require('joi');
let safeGet = require('lodash.get');
let fs = require('fs');
let path = require('path');
let validator = require('validator');
let users = require('../data/users.json');

const createUser = (request, reply) => {
    var first = String(safeGet(request, 'query.first', ''));
    var last = String(safeGet(request, 'query.last', ''));
    var username = String(safeGet(request, 'query.username', ''));
    var password = String(safeGet(request, 'query.password', ''));

    if (!username.match(/^[0-9a-zA-Z_-]+$/) || username.length > 64 || username == '')
        reply({error: "Invalid username"});

    else if (users[username])
        reply({error: "Username already exists"});

    else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,63}/))
        reply({error: "Invalid password"});

    //else if (!validator.isEmail(safeGet(request, 'query.email')))
    // reply({'error': "Username already exists"});
    else if (!validator.isAlpha(first))
        reply({error: "Invalid first name"});

    else if (!validator.isAlpha(last))
        reply({error: "Invalid last name"});

    else {
        var date = new Date();
        var components = [
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];

        var id = components.join("");

        users[username] = {
            first: first,
            last: last,
            password: password,
            id: id
            // Can add other parameters like email
            // 'email': safeGet(req, 'query.email')
        };

        fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users), function (err) {
            console.log(err);
        });

        reply({userId: id});
    }
};

const loginUser = (request, reply) => {
    var username = String(safeGet(request, 'query.username', ''));
    var password = String(safeGet(request, 'query.password', ''));

    if (users[username]) {
        if(safeGet(users[username], 'password') == password)
            reply({
                login: true,
                token: safeGet(users[username], 'id')
            });
        else
            reply({
                login: false,
                error: "Invalid password"
            });
    }
    else {
        reply({
            error: "User " + username + " does not exist"
        });
    }
};

const fetchUser = (request, reply) => {
    // I would think this should require some sort of authorization as it would return password and user id,
    // not sure if I need to worry about that for this test. Or I could not return the password. Either way.
    var username = String(safeGet(request, 'query.username', ''));

    if (users[username]) {
        reply(users[username]);
    }
    else {
        reply({
            error: "User " + username + " does not exist"
        });
    }
};

const updateUser = (request, reply) => {
    var username = String(safeGet(request, 'query.username', ''));

    if (!users[username])
        reply({
            update: false,
            error: "User " + username + " does not exist"
        });
    else {
        // This allows updates to existing parameters. If additional parameters are to be added, this won't do it
        for (var param in request.query) {
            if (users[username].hasOwnProperty(param))
                users[username][param] = request.query[param];
        }

        fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users), function (err) {
            console.log(err);
        });

        reply({
            update: true,
            message: username + " was updated"
        });
    }
};

const deleteUser = (request, reply) => {
    var username = String(safeGet(request, 'query.username', ''));
    var password = String(safeGet(request, 'query.password', ''));

    if (users[username]) {
        delete users[username];

        fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users), function (err) {
            console.log(err);
        });

        reply({
            delete: true,
            message: username + " was deleted"
        });
    }
    else {
        reply({
        delete: false,
        error: "User " + username + " does not exist"
        });
    }
};

module.exports = {
    createUser: {
        handler: createUser,
        description: 'Creates a user',
        notes: 'Returns a unique id',
        tags: ['api'],
        validate: {
            query: {
                first: joi.default('Aaron').description('Enter the user\'s first name'),
                last: joi.default('Ford').description('Enter the user\'s last name'),
                username: joi.default('aaronford').description('Enter the user\'s username. Usernames can contain letters (a-z), numbers (0-9), dashes (-), and underscores (_).'),
                password: joi.default('Abc123!@321cbA').description('Enter the user\'s password. Passwords must contain a minimum of 8 and Maximum of 63 characters with at least 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character.')
            }
        }
    },
    loginUser: {
        handler: loginUser,
        description: 'Login a user',
        notes: 'Returns a token',
        tags: ['api'],
        validate: {
            query: {
                username: joi.default('aaronford').description('Enter the user\'s username.'),
                password: joi.default('Abc123!@321cbA').description('Enter the user\'s password.')
            }
        }
    },
    fetchUser: {
        handler: fetchUser,
        description: 'Fetches a user\'s data',
        notes: 'Returns user\'s data.',
        tags: ['api'],
        validate: {
            query: {
                username: joi.default('aaronford').description('Enter the user\'s username.')
            }
        }
    },
    updateUser: {
        handler: updateUser,
        description: 'Updates a user',
        notes: 'Updates a new user',
        tags: ['api'],
        validate: {
            query: {
                first: joi.default('Ron').description('Enter a new first name'),
                last: joi.default('Chevy').description('Enter a new last name'),
                username: joi.default('aaronford').description('Enter the user\'s username.'),
                password: joi.default('newPassword!').description('Enter a new password.')
            }
        }
    },
    deleteUser: {
        handler: deleteUser,
        description: 'Deletes a user',
        notes: 'Delete an existing user',
        tags: ['api'],
        validate: {
            query: {
                username: joi.default('aaronford').description('Enter the user\'s username. Usernames can contain letters (a-z), numbers (0-9), dashes (-), and underscores (_).')
            }
        }
    }
};