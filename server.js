#!/usr/bin/env node

/**
 * Module dependencies.
 */

(function(){
    'use strict';

    const app = require('./app');
    const debug = require('debug')('app:server');
    const http = require('http');
    const childProcess = require('child_process');
    const cache = require('memory-cache');

    function forkWorkerProcess() {
        const worker = childProcess.fork('./worker.promise');
        worker.on('message', (data) => {
            cache.put('cacached', data);
        });
        worker.on('exit', (code) => {
            console.log(`Worker PID #${worker.pid} Exit with Code: ${code}`);
            forkWorkerProcess();
        });
    }

    // Fork a work process to fetch data
    forkWorkerProcess();

    console.log(`PID #${process.pid} at ${new Date()}`);

    /**
     * Get port from environment and store in Express.
     */

    const port = normalizePort(process.env.PORT || '8080');
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    const server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port, function() {
        console.log('Express server listening on port ' + port);
    });
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string' ?
            'Pipe ' + port :
            'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        const addr = server.address();
        const bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}());
