# Task Manager Web Application

A modern, full-stack task management application built with React.js and Node.js/Express. This application allows users to create, read, update, and delete tasks with a beautiful, responsive user interface.

## 🚀 Features

- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Priority Management**: Set task priorities (High, Medium, Low)
- **Task Completion**: Mark tasks as completed with visual feedback
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Real-time Updates**: Instant feedback for all operations
- **Modern Tech Stack**: React.js frontend with Node.js/Express backend

## 🛠️ Tech Stack

### Frontend
- React.js 18
- Axios for API calls
- Lucide React for icons
- Modern CSS with gradient backgrounds

### Backend
- Node.js
- Express.js
- UUID for unique task IDs
- CORS enabled
- RESTful API design

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## 🔧 Installation & Setup

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd task-manager-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and the React frontend (port 3000).

### Manual Setup

If you prefer to set up each part manually:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

5. **In a new terminal, start the frontend**
   ```bash
   npm run client
   ```

## 🌐 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the Task Manager with some sample tasks
3. Click "Add New Task" to create a new task
4. Fill in the task title, description (optional), and priority
5. Use the checkbox to mark tasks as completed
6. Edit tasks using the "Edit" button
7. Delete tasks using the "Delete" button

## 📡 API Endpoints

The backend provides the following RESTful API endpoints:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/health` - Health check endpoint

### Example API Usage

**Create a new task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description", "priority": "high"}'
```

## 📁 Project Structure

```
task-manager-app/
├── package.json                 # Root package.json with scripts
├── README.md                   # This file
├── server/                     # Backend code
│   ├── package.json           # Server dependencies
│   └── index.js               # Express server and API routes
└── client/                     # Frontend code
    ├── package.json           # Client dependencies
    ├── public/
    │   └── index.html         # HTML template
    └── src/
        ├── index.js           # React entry point
        ├── index.css          # Global styles
        └── App.js             # Main React component
```

## 🎨 UI Features

- **Gradient Background**: Beautiful purple gradient background
- **Card-based Layout**: Each task is displayed in a modern card
- **Priority Badges**: Color-coded priority indicators
- **Hover Effects**: Interactive hover animations
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: User feedback during API operations
- **Error Handling**: Graceful error messages

## 🚀 Deployment

### For Development
The application is ready to run locally with `npm run dev`.

### For Production

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   ```

2. **The server can serve the built files or you can deploy them separately**

3. **For platforms like Heroku, Vercel, or Netlify:**
   - The project structure supports easy deployment
   - Make sure to set the appropriate build commands and environment variables

## 🔄 Available Scripts

From the root directory:

- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React frontend
- `npm run build` - Build the React app for production
- `npm run install-all` - Install dependencies for all parts of the project

## 🤝 Contributing

This is a student project, but you're welcome to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the package.json for details.

## 🎓 Academic Use

This project is suitable for:
- Web development coursework
- Full-stack development demonstrations
- React.js and Node.js learning
- RESTful API design examples
- Modern UI/UX implementation

## 🐛 Known Issues

- Tasks are stored in memory and will reset when the server restarts
- No user authentication (single-user application)
- No data persistence (would need a database for production use)

## 🔮 Future Enhancements

- Add database integration (MongoDB/PostgreSQL)
- Implement user authentication
- Add task categories and tags
- Implement due dates and reminders
- Add task search and filtering
- Add dark mode toggle
- Implement drag-and-drop task reordering

---

**Happy Task Managing! 📝✨**