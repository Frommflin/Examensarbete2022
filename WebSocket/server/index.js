const WebSocket = require(`ws`);
const server = new WebSocket.Server({ port: 8082 });

server.on(`connection`, ws => {
    console.log(`New client connected!`);
    
    ws.on(`close`, () => {
        console.log(`Client has disconnected`);
    });

    ws.on(`message`, data => {
        var message;
        var response;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.log(error);
        }
        //Different handlers depending on message type
        switch(message.type) { 
            case `NEW_USER`: 
                console.log(`Client has submitted a namne: ${message.name}`);
                response = {
                    type: "new_user",
                    name: message.name
                };
                server.clients.forEach((client) => {
                    if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
                        client.send(JSON.stringify(response));
                    }
                });
                break;  
            default: 
                break; 
        }; 
    })
});