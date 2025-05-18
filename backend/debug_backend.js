const express = require('express')
const path = require('path')
const http = require('http')
const { spawn } = require('child_process')
const WebSocket = require('ws');

const server = express()
const http_server = http.createServer(server)
const web_server = new WebSocket.createServer({http_server})

server.use(express.static(path.join(__dirname, '..', 'public')))

const PORT = 3000;
http_server.listen(PORT, () => {
    console.log("Server is no up and Running");
})

const emulator = spawn(".\\Main.cpp");

emulator.stdout.on('data', (data) => {
    console.log("Received Data");
    //Pipe data to WebsSocket
})

emulator.stderr.on('data', (data) => {
    console.log("ERROR: " + data);
})

emulator.on('close', (code) => {
    console.log('Emulator exited with code ${code}');
})

