// Listen for event 'join chat'
module.exports = function (io) {
    // First listen for 'connection' event because it's global event
    io.on('connection', (socket) => {
        // console.log('User connected');
        socket.on('join chat', (params) => {
            // console.log(params);
            socket.join(params.room1);
            socket.join(params.room2);
        });

        socket.on('start_typing', (data) => {
            // console.log(data);
            // send new event only to the receiver
            // we added receiver with 'join_chat' event params.room2
            // emit new event, and returnig same data from client side
            io.to(data.receiver).emit('is_typing', data);
        });
        
        socket.on('stop_typing', (data) => {
            // console.log(data);
            // send new event only to the receiver
            // we added receiver with 'join_chat' event params.room2
            // emit new event, and returnig same data from client side
            io.to(data.receiver).emit('has_stopped_typing', data);
        });
    });
}