const WebSocket = require(`ws`);
const server = new WebSocket.Server({ port: 8082 });

server.on(`connection`, ws => {
    console.log(`New client connected!`);
    
    ws.on(`close`, () => {
        console.log(`Client has disconnected`);
    });

    ws.on(`message`, data => {
        var message;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.log(error);
        }
        server.clients.forEach((client) => {
            if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
                client.send(JSON.stringify(message));
            }
        });
    });
});