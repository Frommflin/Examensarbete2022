const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8082 });

server.on('connection', client => {
    console.log('New client connected!');
    
    client.on('close', () => {
        console.log('Client has disconnected');
    })
});