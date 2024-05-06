import io from 'socket.io-client';
import shortid from 'shortid';
import { useEffect, useState } from 'react';

function App() {
  const [socket, setSocket] = useState();
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');

  useEffect(() => {
    const newSocket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('addTask', (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on('removeTask', (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((_, index) => index !== taskId));
    });

    return () => {
      socket.off('addTask');
      socket.off('removeTask');
    };
  }, [socket]);

  const addTask = (event) => {
    event.preventDefault();

    if (!newTaskName) return;

    const newTask = {
      id: shortid(),
      name: newTaskName,
    };

    //setTasks([...tasks, newTask]);
    socket.emit('addTask', newTask); 
    console.log(tasks);
    setNewTaskName(''); 
  };

  const removeTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((_, index) => index !== taskId));
    socket.emit('removeTask', taskId);
  };

  const handleInputChange = (event) => {
    setNewTaskName(event.target.value);
  };

  return (
    <div className='App'>
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className='tasks-section' id='tasks-section'>
        <h2>Tasks</h2>
        <ul className='tasks-section__list' id='tasks-section__list'>
        {tasks.map((task, index) => (
          <li key={index} className='task'>
            {task.name}
            <button className='btn btn--red' onClick={() => removeTask(index)}>Remove</button>
          </li>
          ))}
        </ul>
        <form id='add-task-form' onSubmit={addTask}>
          <input
            className='text-input'
            autoComplete='off'
            value={newTaskName}
            onChange={handleInputChange}
          />
          <button className='btn' type='submit'>Add</button>
        </form>
      </section>
    </div>
  );
}

export default App;