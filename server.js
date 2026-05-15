const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // Serves your index.html

let players = {};

io.on('connection', (socket) => {
    console.log('Player joined:', socket.id);
    
    // Create player with random color
    players[socket.id] = {
        x: 400, y: 300, 
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        id: socket.id
    };

    // Send the current state to the new player
    socket.emit('init', players);
    // Tell others a new player joined
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle movement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Handle shooting
    socket.on('shoot', (bulletData) => {
        io.emit('bulletFired', bulletData);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(3000, () => console.log('Server live on port 3000'));
