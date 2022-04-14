// ==UserScript==
// @name         TOAST: WebSockets - klient 1
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Användarscript för klient 1 i Examensarbetet
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebSocket/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.
// @grant        none
// ==/UserScript==


var canvas = document.getElementById("canvasBox");
var min = 0;
var xMax = canvas.width;
var yMax = canvas.height;
var x1, x2, y1, y2;

var mouseDownEvent = new MouseEvent('mousedown', {
    view: window,
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x1,
    clientY: y1
});
var mouseUpEvent = new MouseEvent('mouseup', {
    view: window,
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x2,
    clientY: y2
});
var clickEvent = new MouseEvent('click', {
   view: window,
   bubbles: true,
   cancelable: true
});

function enterName(){
    var nameInput = document.getElementById("namebox");
    nameInput.value = "User1";
    return Promise.resolve(nameInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'a'})));
}
function clickButton(){
    var connectBtn = document.getElementById("conecctbtn");
    connectBtn.dispatchEvent(clickEvent);
}

(function() {
    'use strict';
    enterName().then(clickButton);

    x1 = Math.floor(Math.random() * xMax) + min;
    y1 = Math.floor(Math.random() * yMax) + min;
    console.log("x1: " + x1 + " and y1: " + y1);

    x2 = Math.floor(Math.random() * xMax) + min;
    y2 = Math.floor(Math.random() * yMax) + min;
    console.log("x2: " + x2 + " and y2: " + y2);

    console.log(mouseDownEvent);
    console.log(mouseUpEvent);
    canvas.dispatchEvent(mouseDownEvent);
    canvas.dispatchEvent(mouseUpEvent);


})();
