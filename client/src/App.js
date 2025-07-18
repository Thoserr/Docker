import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Trash2, Edit3, Calendar } from 'lucide-react';

const API_BASE_URL = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      setTasks([...tasks, response.data]);
      setFormData({ title: '', description: '', priority: 'medium' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ));
      setEditingTask(null);
      setError('');
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      setError('');
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, completed) => {
    await updateTask(taskId, { completed: !completed });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      createTask(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Start editing task
  const startEditing = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setShowAddForm(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium' });
    setShowAddForm(false);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Task Manager</h1>
        <p>Stay organized and get things done</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Add Task Button */}
      {!showAddForm && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Add New Task
          </button>
        </div>
      )}

      {/* Add/Edit Task Form */}
      {showAddForm && (
        <form className="add-task-form" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <Check size={20} />
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tasks Display */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Create your first task to get started!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-card ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-header">
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id, task.completed)}
                  />
                  <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </h3>
                </div>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                <span className="task-date">
                  <Calendar size={14} style={{ marginRight: '0.25rem' }} />
                  {formatDate(task.createdAt)}
                </span>
              </div>

              <div className="task-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => startEditing(task)}
                  disabled={task.completed}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;