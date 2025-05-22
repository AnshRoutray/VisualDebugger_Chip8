const grid = document.getElementById("display");
let time = 0;

const pixels = [];
for(let i = 0; i < 2048; i++){
    const pixel = document.createElement("div");
    pixel.classList.add('pixel');
    grid.appendChild(pixel);
    pixels.push(pixel);
    console.log("Added Pixel");
}

function accessEmulator(){
    const ws = new WebSocket("ws:localhost:3000")
    ws.onopen = () => {
        console.log("Connections between client and server is established - Client");
    }
    ws.onmessage = (event) => {
        new_time = performance.now();
        if(time != 0){
            let fps = 1000 / (new_time - time);  // same as: 1.0 / ((new_time - time) / 1000)
            console.log(`FPS: ${fps.toFixed(2)}`);
        }
        time = new_time;
        let data = event.data;
        let parsedData = JSON.parse(data);

        if(parsedData.type === "display"){
            updateDisplay(parsedData.display);
        }
    }
}

function updateDisplay(frame){
    for(let i = 0; i < 32; i++){
        for(let j = 0; j < 64; j++){ //Use ternary
            if(frame[i][j] === true){
                pixels[i * 64 + j].style.backgroundColor = "white";
            }
            else {
                pixels[i * 64 + j].style.backgroundColor = "black"
            }
        }
    }
}