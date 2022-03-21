const ws = new WebSocket(`ws://localhost:8082`); //uppdate with link for server? wss for secure websockets
var draw = false;
var messageBox, userName, nameInput, connect, drawShape;
var canvas, ctx, startCoordinates, canvasMemory;
var fillColor, strokeColor, lineSize;

function checkName(){
    nameInput = document.getElementById(`namebox`);
    userName = nameInput.value;
    connect = document.getElementById(`conecctbtn`);

    if((userName == null) || (userName == "")){
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
        type: `CLEAR_SPACE`
    };
    ws.send(JSON.stringify(message));
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
    var active = document.getElementById(`opt${nr}`);
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
function connectToServer(){

    var message = {
        type: `NEW_USER`,
        name: userName
    };
    ws.send(JSON.stringify(message));

    connect.innerHTML = `Connected`;
    connect.style.color = `green`;
    connect.disabled = true;
    nameInput.disabled = true;   
    messageBox.innerHTML += `<p>Your username for this session is <span class="username">${userName}</span></p>`;            
    changeShape(1);

    var settingsBtns = document.getElementsByClassName(`settingInput`);
    for(var a = 0; a<settingsBtns.length; a++){
        var setting = settingsBtns[a];
        setting.style.color = `black`;
        setting.disabled = false;
    }
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
        drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize);

        var sendShape = {
            type: `NEW_SHAPE`,
            shape: drawShape,
            start: startCoordinates,
            end: position,
            fill: fillColor,
            stroke: strokeColor,
            size: lineSize
        };
        ws.send(JSON.stringify(sendShape));
    }
}
function mouseMove(e, t){
    if (draw === true){
        restoreImage();
        var position = getCanvasCoordinates(e);
        drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize);
    } else {
        return;
    }
}
function initServer(){
    messageBox = document.getElementById(`infoBox`);
    
    ws.addEventListener(`open`, () => {
        messageBox.innerHTML += `<p>You are connected to the server! </p>`;
    });

    ws.addEventListener(`message`, data => {
        var message = JSON.parse(data.data);
        switch(message.type) { 
            case `new_user`: 
                messageBox.innerHTML += `<p><span class="username">${message.name}</span> has connected to the server </p>`;
                break;  
            case `new_shape`:
                drawShapes(message.shape, message.start, message.end, message.fill, message.stroke, message.size);
                break;
            case `clear_space`:
                clearSpace();
            default: 
                break; 
        }; 
    })
}