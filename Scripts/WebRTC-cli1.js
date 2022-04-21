// ==UserScript==
// @name         TOAST: WebRTC - client 1
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Userscript for client 1 in Graduation project
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebRTC/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.
// @grant        none
// ==/UserScript==

const canvas = document.getElementById("canvasBox");
const ctx = canvas.getContext(`2d`);
var configuration = {
    "iceServers": [{ "urls": "stun:stun.1.google.com:19302" }]
};
var localConnection = new RTCPeerConnection(configuration);
var connectBtn = document.getElementById("conecctbtn");
var nameInput = document.getElementById(`namebox`);
var messageBox = document.getElementById(`infoBox`);
var min = 0;
var xMax = canvas.width;
var yMax = canvas.height;
var shapeOpt, startCoordinates, endCoordinates, date, dataChannel;

function enterName(){
    var nameInput = document.getElementById("namebox");
    nameInput.value = "User1";
    return Promise.resolve(nameInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'a'})));
}
function clickButton(){
    connectBtn.innerHTML = `Connected`;
    connectBtn.style.color = `green`;
    connectBtn.disabled = true;
    nameInput.disabled = true;

    var settingsBtns = document.getElementsByClassName(`settingInput`);
    for(var a = 0; a<settingsBtns.length; a++){
        var setting = settingsBtns[a];
        setting.style.color = `black`;
        setting.disabled = false;
    }
    StartConnection();
}
function onAnswer(answer) {
    localConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
function onCandidate(candidate) {
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
function handleMessage (event){
    var data = JSON.parse(event.data);
    switch(data.type) {
        case `new_user`:
            messageBox.innerHTML += `<p>P2P connection is established with <span class="username">${data.name}</span></p>`;
            for (var a = 0; a < 10; a++){
                runTest(a+1);
            };
            break;
        default:
            break;
    };
}
function handleDataChannelStatusChange(event) {
    var state = dataChannel.readyState;
    messageBox.innerHTML += `<p>DataChannel is ${state}</p>`;

    if (state === "open") {
        var usermsg = {
            type: `new_user`,
            name: "User1"
        }
        dataChannel.send(JSON.stringify(usermsg));
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
}
function StartConnection(){
    localConnection.onicecandidate = function (event) {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: `candidate`,
                candidate: event.candidate
            }));
        }
    };

    openDataChannel();
    localConnection.createOffer()
        .then((function (offer) {
        var offermsg = {
            type: `offer`,
            offer: offer
        };
        ws.send(JSON.stringify(offermsg)); //sending offer to server
        localConnection.setLocalDescription(offer);
    }))
        .catch(function (error) {
        alert(`An error has occurred: ${error}`);
    })
}
function applySettings(fill, stroke, line){
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = line;
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
function drawShapes(shape, start, end, fill, stroke, size){
    if(shape == 1) {
        drawLine(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 2) {
        drawRect(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 3) {
        drawCircle(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
}
function mouseUpSimulation(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize, id){
    drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize);

    if (id == 1){
        date = new Date(); //saves time from moment shape is drawn (simulation of mouse being released)
    }

    var sendShape = {
        type: `new_shape`,
        shape: drawShape,
        start: startCoordinates,
        end: position,
        fill: fillColor,
        stroke: strokeColor,
        size: lineSize,
        time: date,
        id: id
    };
    dataChannel.send(JSON.stringify(sendShape)); //dataChannel is found from @match
}
function runTest(id){
    var counter = 0;

    counter = parseInt(localStorage.getItem("counter"));
    if(isNaN(counter))
    {
        counter = 0;
    }

    var loop = setInterval(function(){
        //Keep track of rounds
        counter++;
        localStorage.setItem("counter", counter);

        //Put coordinates into object
        var x1 = Math.floor(Math.random() * xMax) + min;
        var x2 = Math.floor(Math.random() * xMax) + min;
        var y1 = Math.floor(Math.random() * yMax) + min;
        var y2 = Math.floor(Math.random() * yMax) + min;
        startCoordinates = {x: x1, y: y1};
        endCoordinates = {x: x2, y: y2};

        //Randomize fill- and stroke color and line width
        var hexCodeFill = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
        var hexCodeStroke = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
        var lineWidth = Math.floor(Math.random() * 10) + 1;

        //Randomize shape to be drawn
        var shapeNr = Math.floor(Math.random() * 3) + 1; //Number between 1 and 3
        var shapeBtn = document.getElementById("opt" + shapeNr).dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));

        //Draw shape with generated randomized data
        mouseUpSimulation(shapeNr, startCoordinates, endCoordinates, hexCodeFill, hexCodeStroke, lineWidth, id);

        if(counter == 50) //Stops the drawing loop
        {
            clearInterval(loop);
            return;
        }
    }, 500);
}
(function() {
    'use strict';
    localStorage.setItem("counter","");
    ws.addEventListener(`message`, data => { //ws is found from @match
        var message = JSON.parse(data.data);
        console.log(message);
        switch(message.type) {
            case `start_offer`:
                enterName().then(clickButton);
                alert("WAIT");
                break;
            case `answer`:
                onAnswer(message.answer);
                break;
            case `candidate`:
                onCandidate(message.candidate);
                break;
            default:
                break;
        }
    });
})();