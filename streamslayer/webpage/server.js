const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let webpageContent = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');

app.get('/', (req, res) => {
    res.send(webpageContent);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', message => {
        console.log('Received:', message);
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
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