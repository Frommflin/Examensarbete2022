// ==UserScript==
// @name         TOAST: WebSockets - klient 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Användarscript för klient 2 i Examensarbetet
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebSocket/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const ws = new WebSocket(`ws://localhost:8082`);
    ws.addEventListener(`message`, data => {
        var message = JSON.parse(data.data);
        switch(message.type) {
            case `new_shape`:
                console.log("New chape recieved"); //Need to take time after shape is printed somehow??
                console.log(message);
                break;
            default:
                break;
        };
    });
})();