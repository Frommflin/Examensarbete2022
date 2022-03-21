var nameInput;
var connect;
var drawShape; //line=1, square=2, circle=3
var draw; 
var fillColor = "#000000";
var strokeColor = "#000000";
var mx1, mx2;
var my1, my2;

function checkName(){
    nameInput = document.getElementById("namebox");
    connect = document.getElementById("conecctbtn");

    if((nameInput.value == null) || (nameInput.value == "")){
        connect.disabled = true;
        connect.style.color = "lightgrey";
    } else{
        connect.disabled = false;
        connect.style.color = "blue";
    }
}
function connectToServer(){
    connect.innerHTML = "Connected";
    connect.style.color = "green";
    connect.disabled = true;
    nameInput.disabled = true;               
    changeShape(1);
}
function changeShape(nr){
    var optBtns = document.getElementsByClassName("optBtns");
    for(var a = 0; a<optBtns.length; a++){
        var option = optBtns[a];
        option.style.color = "black";
        option.disabled = false;
    }
    var active = document.getElementById("opt"+nr);
    active.disabled = true;
    active.style.color = "green";
    drawShape = nr;
}
function startCanvas(){
    var canvas = document.getElementById("canvasBox");
    draw = canvas.getContext("2d");
}
function mouseDown(e){ //should start drawing of chosen shape
    var box = e.target.getBoundingClientRect();
    mx1 = e.clientX - box.left; // mouse x-coordinate
    my1 = e.clientY - box.top;  // mouse y-coordinate
    console.log(`Starting coordinates: x = ${mx1}, y = ${my1}`);

    if (event.which == 2){
        event.preventDefault(); //Limits menu to save/copy image
    }
}
function mouseMove(e, t){ //keeping track of the mouse coordinates within the canvas
    var box = e.target.getBoundingClientRect();
    mx2 = e.clientX - box.left; // mouse x-coordinate
    my2 = e.clientY - box.top;  // mouse y-coordinate
}
function mouseUp(e){
    var box = e.target.getBoundingClientRect();
    mx2 = e.clientX - box.left; // mouse x-coordinate
    my2 = e.clientY - box.top;  // mouse y-coordinate

    console.log(`End coordinates: x = ${mx2}, y = ${my2}`);

    //call drawing function
    if(drawShape == 1) { //This works but does not show until finished
        drawLine(mx1, my1, mx2, my2);
    } else if (drawShape == 2) {
        drawRect(mx1, my1, mx2, my2);
    } else if (drawShape == 3) {
        drawCircle(mx1, my1, mx2, my2);
    }
}
function drawRect(x1, y1, x2, y2){
    draw.beginPath();
    draw.moveTo(x1, y1);
    draw.lineTo(x2,y1);
    draw.lineTo(x2,y2);
    draw.lineTo(x1,y2);
    draw.lineTo(x1,y1);
    draw.closePath();
    draw.fill();
    draw.stroke();
}
function drawLine(x1, y1, x2, y2){
    draw.beginPath();
    draw.moveTo(x1, y1);
    draw.lineTo(x2,y2);
    draw.closePath();
    draw.stroke();
}
function drawCircle(x1, y1, x2, y2){
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
    draw.beginPath();
    draw.arc(x1, y1, radius, 0, 2*Math.PI);
    draw.closePath();
    draw.fill();
    draw.stroke();
}
function clearSpace(){
    draw.clearRect(0,0,900,500);
}
function setFill(color){
    fillColor = color;
    draw.fillStyle = fillColor;
}
function setStroke(color){
    strokeColor = color;
    draw.strokeStyle = strokeColor;
}
function setWidth(pixels){
    draw.lineWidth = pixels;
}