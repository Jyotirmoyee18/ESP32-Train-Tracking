const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Allow connections from ESP32
});

// Serve static files from the "public" folder
app.use(express.static('public'));

// Endpoint to serve the GeoJSON file
app.get('/gates', (req, res) => {
    fs.readFile('./gates.geojson', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading GeoJSON file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('gpsData', (data) => {
        console.log(`Train Location Received: Lat=${data.latitude}, Lng=${data.longitude}`);
        io.emit('trainLocationUpdate', data); // Broadcast location to all clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
