var Hapi = require('hapi');
var Path = require('path');
var Hoek = require('hoek');

var users = {
    john: {
        id: 'john',
        password: 'password',
        name: 'John Doe'
    }
};

var home = function (request, reply) {
    reply.view('index', { userName: request.auth.credentials.name });
};

var login = function (request, reply) {

    if (request.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    var message = '';
    var account = null;

    if (request.method === 'post') {

        if (!request.payload.username ||
            !request.payload.password) {

            message = 'Missing username or password';
        }
        else {
            account = users[request.payload.username];
            if (!account ||
                account.password !== request.payload.password) {

                message = 'Invalid username or password';
            }
        }
    }

    if (request.method === 'get' || message) {

        return reply.view('login', {message: message});
    }

    request.auth.session.set(account);
    return reply.redirect('/');
};

var logout = function (request, reply) {

    request.auth.session.clear();
    return reply.redirect('/');
};

var server = new Hapi.Server();
server.connection({ port: 8000 });

server.register(require('hapi-auth-cookie'), function (err) {

    server.auth.strategy('session', 'cookie', {
        password: 'secret',
        cookie: 'sid-example',
        redirectTo: '/login',
        isSecure: false
    });
});

server.route([
    {
        method: 'GET',
        path: '/',
        config: {
            handler: home,
            auth: 'session'
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/login',
        config: {
            handler: login,
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/logout',
        config: {
            handler: logout,
            auth: 'session'
        }
    }
]);

server.register(require('vision'), function (err) {
    Hoek.assert(!err, err);
    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        layout: 'layout',
        path: './views',
        layoutPath: './views/layout',
        helpersPath: './views/helpers'
    });
});

server.start(function (err) {

    if (err) {
        throw err;
    }
    console.log('Server started at: ' + server.info.uri);
});