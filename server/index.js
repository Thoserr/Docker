const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory task storage (in a real app, you'd use a database)
let tasks = [
  {
    id: uuidv4(),
    title: 'Welcome to Task Manager',
    description: 'This is your first task. You can edit or delete it!',
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Try adding a new task',
    description: 'Click the "Add Task" button to create a new task',
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString()
  }
];

// Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get a single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(task);
});

// Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium' } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    priority,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const { title, description, completed, priority } = req.body;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
    ...(priority !== undefined && { priority }),
    updatedAt: new Date().toISOString()
  };

  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Task Manager API is ready!`);
});