const express = require('express');
const fs = require('fs');
const path = require('path');
const { createServer } = require('node:http');
const { Server: SocketIOServer } = require('socket.io');


const app = express();
const PORT = 3000;

const server = createServer(app);
const io = new SocketIOServer(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let webpageContent = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');

app.get('/', (req, res) => {
    res.send(webpageContent);
});

io.on('connection', socket => {
    console.log('Client connected');
    socket.on('disconnect', message => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    io.send("general", data)
}

app.post('/update', (req, res) => {
    console.log('Received update request:', req.body);
    const { update } = req.body;
    if (update) {
        broadcast({ action: 'update', content: update });
        res.send({ status: 'success', message: 'Action triggered!' });
    } else {
        res.send({ status: 'error', message: 'No update content provided.' });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
