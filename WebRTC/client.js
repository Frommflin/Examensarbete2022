const ws = new WebSocket(`ws://localhost:8081`);
var configuration = { 
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
};
var localConnection = new RTCPeerConnection(configuration);
var draw = false; 
var offerAllowed = false;
var messageBox, userName, nameInput, connect, drawShape;
var canvas, ctx, startCoordinates, canvasMemory;
var fillColor, strokeColor, lineSize, dataChannel;

function startOffer(){
    offerAllowed = true;
    console.log(`You can send an offer`);
}
function handleMessage (event){ 
    //needs to hold handling for different messages with a switch. 
    //Some poke on messageBox, some the drawingspace
    var data = JSON.parse(event.data);
    console.log(data);
    switch(data.type) { 
        case `new_user`: 
            messageBox.innerHTML += `<p>P2P connection is established with <span class="username">${data.name}</span></p>`;
            break; 
        case `new_shape`:
            drawShapes(data.shape, data.start, data.end, data.fill, data.stroke, data.size, true);
            break;
        case `clear_space`:
            clearSpace();
        case `shape_confirmed`:
            console.log(`Shape confirmed by other clients!`);
        default: 
            break; 
    };  
}
function handleDataChannelStatusChange(event) {
    var state = dataChannel.readyState;
    console.log("Data channel's status has changed to " + state);
    messageBox.innerHTML += `<p>DataChannel is ${state}</p>`;

    if (state === "open") {
        var usermsg = {
            type: `new_user`,
            name: userName
        }
        dataChannel.send(JSON.stringify(usermsg));
    }
}
function onOffer(offer) { 
    localConnection.setRemoteDescription(new RTCSessionDescription(offer)); 
    console.log(`Offer set as remote description`);
    
}
function onAnswer(answer) { 
    localConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log(`Answer set as remote description`); 
}
function onCandidate(candidate) { 
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log(`IceCandidate added`); 
}
function checkName(){
    nameInput = document.getElementById(`namebox`);
    userName = nameInput.value;
    connect = document.getElementById(`conecctbtn`);

    if((userName == null) || (userName == ``)){
        connect.disabled = true;
        connect.style.color = `lightgrey`;
    } else{
        connect.disabled = false;
        connect.style.color = `blue`;
    }
}
function clearSpace(){
    ctx.clearRect(0,0,900,500);

    var message = {
        type: `clear_space`
    };
    dataChannel.send(JSON.stringify(message));
}
function setLocalSettings(fill, stroke, pixels){
    fillColor = fill;
    strokeColor = stroke;
    lineSize = pixels;
}
function applySettings(fill, stroke, line){
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = line;
}
function changeShape(nr){
    var optBtns = document.getElementsByClassName(`optBtns`);
    for(var a = 0; a<optBtns.length; a++){
        var option = optBtns[a];
        option.style.color = `black`;
        option.disabled = false;
    }
    var active = document.getElementById(`opt`+nr);
    active.disabled = true;
    active.style.color = `green`;
    drawShape = nr;
}
function getCanvasCoordinates(event){
    var box = event.target.getBoundingClientRect();
    var mx = event.clientX - box.left; // mouse x-coordinate
    var my = event.clientY - box.top;  // mouse y-coordinate
    return {x: mx, y: my};
}
function saveImage(){
    canvasMemory = ctx.getImageData(0, 0, canvas.width, canvas.height);
}
function restoreImage(){
    ctx.putImageData(canvasMemory, 0, 0);
}
function getLocalSettings(){
    var fillInput = document.getElementById(`fillColor`);
    var strokeColorInput = document.getElementById(`strokeColor`);
    var strokeWidthInput = document.getElementById(`strokeSize`);

    setLocalSettings(fillInput.value, strokeColorInput.value, strokeWidthInput.value);
    applySettings(fillInput.value, strokeColorInput.value, strokeWidthInput.value);
}
function startCanvas(){
    canvas = document.getElementById(`canvasBox`);
    ctx = canvas.getContext(`2d`);
    getLocalSettings();
}
function drawRect(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x1,y2);
    ctx.lineTo(x1,y1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
function drawLine(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2,y2);
    ctx.closePath();
    ctx.stroke();
}
function drawCircle(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    var x;
    var y;
    if (x1 > x2){
        x = x1 - x2;
    } else if (x1 < x2) {
        x = x2 - x1;
    } else {
        x = 10;
    }
    if (y1 > y2){
        y = y1 - y2;
    } else if (y1 < y2) {
        y = y2 - y1;
    } else {
        y = 10;
    }

    var radius = Math.hypot(x, y);
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
function drawShapes(shape, start, end, fill, stroke, size, remote){
    if(shape == 1) { 
        drawLine(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 2) {
        drawRect(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 3) {
        drawCircle(start.x, start.y, end.x, end.y, fill, stroke, size);
    }

    if(remote === true){
        var confirmation = {
            type: `shape_confirmed`
        }
        dataChannel.send(JSON.stringify(confirmation));
    }
}
function mouseDown(event){
    if (event.which == 1){ //Left-click on mouse
        getLocalSettings();
        draw = true;
        startCoordinates = getCanvasCoordinates(event);
        saveImage();
    }
    if (event.which == 2){ //Right-click on mouse
        event.preventDefault(); //Limits menu to save/copy image
    }
}
function mouseUp(event){
    if (event.which == 1){
        draw = false;
        restoreImage();
        var position = getCanvasCoordinates(event);
        drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize, false);

        var sendShape = {
            type: `new_shape`,
            shape: drawShape,
            start: startCoordinates,
            end: position,
            fill: fillColor,
            stroke: strokeColor,
            size: lineSize
        };
        dataChannel.send(JSON.stringify(sendShape));
    }
}
function mouseMove(e, t){
    if (draw === true){
        restoreImage();
        var position = getCanvasCoordinates(e);
        drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize, false);
    } else {
        return;
    }
}
function openDataChannel(){
    var dataChanOpts = { 
        reliable:true 
    }; 

    dataChannel = localConnection.createDataChannel(`TOASTdc`, dataChanOpts);
    dataChannel.onopen = handleDataChannelStatusChange;
    dataChannel.onclose = handleDataChannelStatusChange;
    dataChannel.onmessage = handleMessage;
    dataChannel.onerror = function(event){
        console.log(`Error occured: ${event.data}`);
    }
    console.log("Data channel created");
}
function StartConnection(){
    console.log(`Connection created`);

    //Visual changes and canvas shape-setting
    connect.innerHTML = `Connected`;
    connect.style.color = `green`;
    connect.disabled = true;
    nameInput.disabled = true;
    changeShape(1);

    var settingsBtns = document.getElementsByClassName(`settingInput`);
    for(var a = 0; a<settingsBtns.length; a++){
        var setting = settingsBtns[a];
        setting.style.color = `black`;
        setting.disabled = false;
    }

    //Connection setup
    localConnection.onicecandidate = function (event) { 
        
        if (event.candidate) { 
            ws.send(JSON.stringify({ 
                type: `candidate`, 
                name: "ICE",
                candidate: event.candidate 
            })); 
        } 
    };

    if(offerAllowed == true){
        openDataChannel();
        localConnection.createOffer()
            .then((function (offer) { 
                console.log(`Offer created by ${userName}:`);
                console.log(offer);

                var offermsg = {
                    type: `offer`,
                    name: userName,
                    offer: offer
                };
                ws.send(JSON.stringify(offermsg)); //sending offer to server
                    
                localConnection.setLocalDescription(offer);
                console.log(`Offer set as local description`);
                
            }))
            .catch(function (error) { 
                alert(`An error has occurred: ${error}`); 
            })
    } else {
        localConnection.createAnswer()
            .then(function (answer) { 
                localConnection.setLocalDescription(answer); 
                console.log(`Answer created by ${userName}:`);
                console.log(answer);
                console.log(`Answer set as local description`);
                 
                
                var answermsg = {
                    type: `answer`,
                    name: userName,
                    answer: answer
                };
                ws.send(JSON.stringify(answermsg)); //sending answer to server

                localConnection.ondatachannel = function (event){
                    dataChannel = event.channel;
                    dataChannel.onopen = handleDataChannelStatusChange;
                    dataChannel.onclose = handleDataChannelStatusChange;
                    dataChannel.onerror = function(event){
                        console.log(`Error occured: ${event.data}`);
                    }
                    dataChannel.onmessage = handleMessage;
                }
            })
            .catch(function (error) { 
                alert(`oops...error: ${error}`); 
            })
    }
}
function initServer(){
    messageBox = document.getElementById(`infoBox`);

    ws.onopen = function () { 
        console.log(`Connected`); 
    };
    ws.onerror = function (err) { 
        console.log(`Got error`, err); 
    };
    ws.onmessage = function(message){
        var data = JSON.parse(message.data); 
        console.log(`Recieved message of type '${data.type}'`);
            
        switch(data.type) { 
            case `start_offer`: 
                startOffer(); 
                break; 
            case `offer`: 
                onOffer(data.offer, data.name);
                break; 
            case `answer`: 
                onAnswer(data.answer); 
                break; 
            case `candidate`: 
                onCandidate(data.candidate); 
                break; 
            default: 
                break; 
        } 
    };
}