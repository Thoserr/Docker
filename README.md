# 📚 StudyHub - Full-Stack Study Notes Platform

StudyHub is a comprehensive web platform that allows students to upload, download, and purchase study notes (PDF). The system supports both free and paid notes, includes role-based authentication for users and admins, and features a secure backend with file upload capabilities.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + Prisma ORM + MySQL
- **Frontend**: React.js + Vite + TailwindCSS + Zustand
- **File Storage**: Cloudinary (configurable)
- **Authentication**: JWT-based with role-based access control

## 🔑 Features

### Authentication & User Management
- JWT-based user authentication
- Role-based access control (User, Admin)
- User profile management with avatar upload
- Secure password hashing

### Uploader System
- Apply to become an uploader
- Admin approval process for uploaders
- Uploader profile with pen name, faculty, major, etc.

### Study Notes Management
- Upload PDF study notes with metadata
- Multiple preview images support
- Set pricing (free or paid)
- Admin approval system for notes
- Advanced search and filtering

### Purchase & Payment System
- Create orders for paid notes
- Upload payment slip images
- Admin payment confirmation
- Download access control

### Admin Panel
- Dashboard with statistics
- User management
- Sheet approval/rejection
- Order and payment management
- Uploader application approval

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyhub
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**

   **Backend (.env)**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env`:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/studyhub"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   
   # Admin Credentials
   ADMIN_EMAIL="admin@studyhub.com"
   ADMIN_PASSWORD="admin123"
   ```

   **Frontend (.env)**:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   
   Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=StudyHub
   VITE_APP_VERSION=1.0.0
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API server at `http://localhost:5000`
   - Frontend development server at `http://localhost:5173`

## 🔧 API Configuration

### Cloudinary Setup

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your backend `.env` file

### Database Setup

1. Create a MySQL database named `studyhub`
2. Update the `DATABASE_URL` in backend `.env`
3. Run migrations: `cd backend && npx prisma migrate dev`

## 👤 Default Admin Account

After running the seed script, you can log in with:
- **Email**: admin@studyhub.com
- **Password**: admin123

## 📁 Project Structure

```
studyhub/
├── backend/                 # Express.js API server
│   ├── middleware/         # Authentication & validation
│   ├── routes/            # API route handlers
│   ├── prisma/            # Database schema & migrations
│   ├── utils/             # Utilities (Cloudinary, etc.)
│   └── server.js          # Main server file
├── frontend/               # React.js client application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API service layer
│   │   └── utils/         # Frontend utilities
│   └── public/            # Static assets
└── package.json           # Root package.json for scripts
```

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Role-based access control
- File upload validation and security
- Rate limiting and request validation
- CORS configuration
- Secure environment variable handling

## 📊 Database Schema

The application uses Prisma ORM with the following main models:

- **User**: User accounts with authentication
- **UserInfo**: Extended user profile information
- **UploaderProfile**: Uploader-specific information
- **Sheet**: Study notes/sheets with metadata
- **Order**: Purchase orders for paid sheets

## 🎨 UI Components

The frontend uses:
- **TailwindCSS** for styling with custom design system
- **Lucide React** for consistent iconography
- **React Hook Form** for form validation
- **React Query** for server state management
- **React Hot Toast** for notifications

## 🔄 Development Workflow

1. **Backend Development**:
   ```bash
   cd backend
   npm run dev          # Start development server
   npx prisma studio    # Open database GUI
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev          # Start Vite development server
   npm run build        # Build for production
   ```

3. **Database Changes**:
   ```bash
   cd backend
   npx prisma migrate dev --name description
   npx prisma generate
   ```

## 🚀 Production Deployment

1. **Build the frontend**:
   ```bash
   cd frontend && npm run build
   ```

2. **Set up production environment variables**

3. **Deploy backend** to your preferred hosting service

4. **Deploy frontend** build to static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

If you encounter any issues or need help setting up the project:

1. Check the [Issues](../../issues) section
2. Review the setup instructions carefully
3. Ensure all environment variables are correctly configured
4. Verify your database connection and Cloudinary setup

---

**Happy Coding!** 🎉

Made with ❤️ by the StudyHub Team