const express = require('express')
const path = require('path')
const http = require('http')
const { spawn } = require('child_process')
const WebSocket = require('ws');

const server = express()
const http_server = http.createServer(server)
const web_server = new WebSocket.Server({server: http_server})

server.use(express.static(path.join(__dirname, '..', 'public')))

const PORT = 3000;
http_server.listen(PORT, () => {
    console.log("Server is now up and Running on PORT: " + PORT);
})

web_server.on('connection', (stream) => {
    console.log("Connected Successfully");

    const emulator = spawn(path.join(__dirname, '/../emulator/chip8.exe'));

    emulator.stdout.on('data', (data) => {
        const output = data.toString();
        //Pipe data to WebsSocket
        stream.send(output);
    })

    emulator.stderr.on('data', (data) => {
        console.error("ERROR: " + data);
    })

    emulator.on('close', (code) => {
        console.log(`Emulator exited with code ${code}`);
    })

    stream.on('message', (data) => {
        try {
            console.log("Received Data from client through web socket");
            
            //Send Data to Emulator.
            emulator.stdin.write(data + '\n', () => {
                console.log("Sending Data to Emulator.");
            });

        }
        catch(err){
            console.error("Error in Parsing Data From Client " + err);
        }
    })

    stream.on('close', (data) => {
        console.log("Closing Emulator Process");
        emulator.kill();
    })
})