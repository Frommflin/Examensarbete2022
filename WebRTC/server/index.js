const WebSocket = require(`ws`);
const server = new WebSocket.Server({ port: 8081 });

server.on(`connection`, ws => {
    console.log(`New client has connected!`);
    console.log(`Number of live clients: ${server.clients.size}`);

    var startmsg = {
        type: `start_offer`
    };
    if(server.clients.size == 1){
        ws.send(JSON.stringify(startmsg));
    }
    
    ws.on(`close`, () => {
        console.log(`Client has disconnected!`);
        console.log(`Number of live clients: ${server.clients.size}`);
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