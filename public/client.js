const grid = document.getElementById("display");
let ws = -1;

const keypad = [false, false, false, false, false, 
false, false, false, false, false, false, false, false, false, false, false];

function keyEvent(event, mode) {
    let letter;
    switch(event.key){
        case "1": 
            letter = "1";
            break;
        case "2":
            letter = "2";
            break;
        case "3":
            letter = "3";
            break;
        case "4":
            letter = "12";
            break;
        case "q":
            letter = "4";
            break;
        case "w":
            letter = "5"
            break;
        case "e":
            letter = "6";
            break;
        case "r":
            letter = "13";
            break;
        case "a":
            letter = "7";
            break;
        case "s":
            letter = "8";
            break;
        case "d":
            letter = "9";
            break;
        case "f":
            letter = "14";
            break;
        case "z":
            letter = "10";
            break;
        case "x":
            letter = "0";
            break;
        case "c":
            letter = "11";
            break;
        case "v":
            letter = "15";
            break;
        default:
            console.log("NOT VALID KEY");
            letter = "NO";
    }
    if(letter !== "NO" && ws !== -1){
        if((mode === "down" && keypad[parseInt(letter)] === false) || 
        (mode === "up" && keypad[parseInt(letter)] === true)){
            console.log(letter + " triggered");
            let message = {type: "input", letter: letter};
            ws.send(JSON.stringify(message));
            keypad[parseInt(letter)] = !keypad[parseInt(letter)];
        }
    }
}

const pixels = [];
for(let i = false; i < 2048; i++){
    const pixel = document.createElement("div");
    pixel.classList.add('pixel');
    grid.appendChild(pixel);
    pixels.push(pixel);
    console.log("Added Pixel");
}

function accessEmulator(){
    ws = new WebSocket("ws:localhost:3000")
    ws.onopen = () => {
        console.log("Connections between client and server is established - Client");
    }
    ws.onmessage = (event) => {
        let data = event.data;
        let parsedData = JSON.parse(data);

        if(parsedData.type === "display"){
            updateDisplay(parsedData.display);
        }
    }
}

function updateDisplay(frame){
    for(let i = 0; i < frame.length; i++){
        let word = frame[i];
        let x = Number(word[0] + word[1]);
        let y = Number(word[2] + word[3]);
        if(pixels[x * 64 + y].style.backgroundColor === "white"){
            pixels[x * 64 + y].style.backgroundColor = "black";
        }
        else {
            pixels[x * 64 + y].style.backgroundColor = "white";
        }
    }
}

document.addEventListener("keydown", (event) => {
    keyEvent(event, "down");
});
document.addEventListener("keyup", (event) => {
    keyEvent(event, "up");
});