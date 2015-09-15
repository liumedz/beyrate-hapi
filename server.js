var Hapi = require('hapi');
var Good = require('good');

var server = new Hapi.Server();
server.connection({port: 3000});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: function (request, reply) {
        reply.file('picture.jpg');
    }
});

server.register(require('inert'), function (err) {


});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }
});

server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});