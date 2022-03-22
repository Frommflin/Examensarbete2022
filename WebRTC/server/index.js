const WebSocket = require(`ws`);
const server = new WebSocket.Server({ port: 8082 });

server.on(`connection`, ws => {
    console.log(`New client connected!`);
    
    ws.on(`close`, () => {
        console.log(`Client has disconnected`);
    });

    ws.on(`message`, data => {
        console.log(`Message recieved`);
    });
});