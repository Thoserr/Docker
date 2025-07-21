# ⚡ Quick Setup - StudyHub Platform

## 🚀 สำหรับคนรีบ (15 นาทีเสร็จ)

### Prerequisites
✅ Node.js 18+ ✅ MySQL ✅ Git

### Step 1: Clone & Install
```bash
# Clone project
git clone https://github.com/YOUR_USERNAME/studyhub-platform.git
cd studyhub-platform

# Install Backend
cd backend
npm install
cp .env.example .env

# Install Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
```

### Step 2: Database Setup
```sql
-- Create database
CREATE DATABASE studyhub;
```

```bash
# Back to backend folder
cd ../backend

# Setup database
npx prisma generate
npx prisma db push
```

### Step 3: Environment Variables

#### Backend (.env):
```env
DATABASE_URL="mysql://root:password@localhost:3306/studyhub"
JWT_SECRET="your-secret-key-123456"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=5000
NODE_ENV=development
```

#### Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Run Servers

#### Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
🟢 Backend: http://localhost:5000

#### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
🟢 Frontend: http://localhost:5173

## 🎯 Quick Test

1. เปิด http://localhost:5173
2. สมัครสมาชิก
3. เข้าสู่ระบบ
4. ลองใช้งาน!

## 🆘 Quick Fix

### ❌ MySQL Error
```bash
# Start MySQL
sudo systemctl start mysql
# OR
brew services start mysql
```

### ❌ Port 5000 Busy
```bash
lsof -ti:5000 | xargs kill -9
```

### ❌ Dependencies Error
```bash
# Clear cache & reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**เสร็จแล้ว! ใช้เวลาแค่ 15 นาที 🎉**

*สำหรับคำแนะนำละเอียด ดูไฟล์ `installation-guide.md`*