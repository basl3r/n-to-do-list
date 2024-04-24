const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on: ', 8000);
});
const socket = require('socket.io');
const io = socket(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...'});
});

let tasks = [];

io.on('connection', (socket) => {
  console.log('New client has joined' + socket.id);
  socket.broadcast.emit('updateData', tasks);

  socket.on('addTask', (newTask) => {
    tasks.push({ name: newTask });
    console.log('Tasks after:', tasks);
    io.emit('addTask', newTask);
  });

  socket.on('removeTask', (taskId) => {
    tasks.splice(taskId, 1); 
    console.log('Array after: ', tasks);
    io.emit('removeTask', taskId);
  });
});