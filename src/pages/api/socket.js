import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', socket => {
    console.log('Client connected');
    // You can define event handlers here
  });

  console.log('Socket server started');
  res.end();
};

export default SocketHandler;
