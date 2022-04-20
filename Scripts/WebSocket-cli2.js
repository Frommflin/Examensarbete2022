// ==UserScript==
// @name         TOAST: WebSockets - client 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Userscript for client 2 in Graduation project
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebSocket/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
// @grant        none
// ==/UserScript==

const canvas = document.getElementById("canvasBox");
const ctx = canvas.getContext(`2d`);
var connectBtn = document.getElementById("conecctbtn");

function enterName(){
    var nameInput = document.getElementById("namebox");
    nameInput.value = "User2";
    return Promise.resolve(nameInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'a'})));
}
function clickButton(){
    connectBtn.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    }));
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
(function() {
    'use strict';
    localStorage.setItem("data", ("Shape,Bundled Time,Single Time"));
    ws.addEventListener(`open`, () => { //ws if found from @match
        enterName().then(clickButton);
    });

    ws.addEventListener(`message`, data => {
        var message = JSON.parse(data.data);

        switch(message.type) {
            case `new_user`:
                //
                break;
            case `new_shape`:
                drawShapes(message.shape, message.start, message.end, message.fill, message.stroke, message.size);

                if(message.id == 10){
                    var endtime = new Date();
                    var starttime = new Date(message.time);
                    var bundleResult = endtime.getTime() - starttime.getTime();
                    var singleResult = bundleResult / 10;

                    localStorage.setItem("data", (localStorage.getItem("data") + "\n" + message.shape + "," + bundleResult + "," + singleResult));
                }
                break;
            default:
                break;
        };
    });
})();