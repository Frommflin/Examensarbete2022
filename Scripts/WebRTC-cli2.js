// ==UserScript==
// @name         TOAST: WebRTC - client 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Userscript for client 2 in Graduation project
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebRTC/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
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
var dataChannel;

function enterName(){
    var nameInput = document.getElementById("namebox");
    nameInput.value = "User2";
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
function onOffer(offer) {
    localConnection.setRemoteDescription(offer);
    enterName().then(clickButton);
}
function onCandidate(candidate) {
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
function handleMessage (event){
    var message = JSON.parse(event.data);

    switch(message.type) {
        case `new_user`:
            messageBox.innerHTML += `<p>P2P connection is established with <span class="username">${message.name}</span></p>`;
            break;
        case `new_shape`:
            drawShapes(message.shape, message.start, message.end, message.fill, message.stroke, message.size);

            if(message.id == 10){
                var endtime = new Date();
                var starttime = new Date(message.time);
                var bundleResult = endtime.getTime() - starttime.getTime();
                var singleResult = bundleResult / 10;

                localStorage.setItem("data-rtc", (localStorage.getItem("data-rtc") + "\n" + bundleResult + "," + singleResult));
            }
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
            name: "User2"
        }
        dataChannel.send(JSON.stringify(usermsg));
    }
}
function StartConnection(){
    //Connection setup
    localConnection.onicecandidate = function (event) {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: `candidate`,
                candidate: event.candidate
            }));
        }
    };

    localConnection.createAnswer()
        .then(function (answer) {
        console.log("Creating answer");
        localConnection.setLocalDescription(answer);

        var answermsg = {
            type: `answer`,
            answer: answer
        };
        console.log(answermsg);
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

(function() {
    'use strict';
    localStorage.setItem("data-rtc", ("Bundled Time,Single Time"));
    ws.addEventListener(`message`, data => { //ws is found from @match
        var message = JSON.parse(data.data);
        switch(message.type) {
            case `offer`:
                onOffer(message.offer);
                break;
            case `candidate`:
                onCandidate(message.candidate);
                break;
            default:
                break;
        };
    });
})();