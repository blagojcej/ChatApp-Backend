// Listen for event 'join chat'
module.exports = function(io) {
    // First listen for 'connection' event because it's global event
    io.on('connection', (socket) => {
        // console.log('User connected');
        socket.on('join chat', (params) => {
            // console.log(params);
            socket.join(params.room1);
            socket.join(params.room2);
        });
    });
}