# คู่มือการติดตั้งโปรเจค StudyHub

## 📋 สิ่งที่ต้องเตรียมก่อนติดตั้ง

### 1. Software ที่จำเป็น
- **Node.js** (เวอร์ชัน 18.0 หรือใหม่กว่า)
- **npm** (มาพร้อมกับ Node.js)
- **Git** (สำหรับ clone โปรเจค)
- **MySQL** (เวอร์ชัน 8.0 หรือใหม่กว่า)

### 2. บัญชีที่ต้องมี
- **Cloudinary Account** (สำหรับอัปโหลดไฟล์)
- **GitHub Account** (สำหรับ clone โปรเจค)

## 🚀 ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1: ดาวน์โหลดโปรเจค

#### วิธีที่ 1: Clone จาก GitHub
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/studyhub-platform.git

# เข้าไปในโฟลเดอร์โปรเจค
cd studyhub-platform
```

#### วิธีที่ 2: ดาวน์โหลด ZIP
1. ไปที่ GitHub repository
2. คลิก **"Code"** > **"Download ZIP"**
3. แตกไฟล์ ZIP
4. เข้าไปในโฟลเดอร์ที่แตกแล้ว

### ขั้นตอนที่ 2: ติดตั้ง Backend

```bash
# เข้าไปในโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
```

#### แก้ไขไฟล์ .env ในโฟลเดอร์ backend:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/studyhub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Server
PORT=5000
NODE_ENV=development
```

### ขั้นตอนที่ 3: ตั้งค่า Database

#### สร้างฐานข้อมูล MySQL:
```sql
CREATE DATABASE studyhub;
```

#### รัน Prisma Migration:
```bash
# ใน backend folder
npx prisma generate
npx prisma db push
```

#### (ไม่บังคับ) เพิ่มข้อมูลตัวอย่าง:
```bash
npx prisma db seed
```

### ขั้นตอนที่ 4: ติดตั้ง Frontend

```bash
# เปิด terminal ใหม่ แล้วเข้าไปในโฟลเดอร์ frontend
cd frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
```

#### แก้ไขไฟล์ .env ในโฟลเดอร์ frontend:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔧 การตั้งค่า Cloudinary

### 1. สร้างบัญชี Cloudinary
1. ไปที่ [cloudinary.com](https://cloudinary.com)
2. สมัครสมาชิกฟรี
3. ไปที่ Dashboard

### 2. หา API Credentials
ใน Dashboard จะเห็น:
- **Cloud Name**
- **API Key** 
- **API Secret**

### 3. นำข้อมูลมาใส่ในไฟล์ .env
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## ▶️ การรันโปรเจค

### รัน Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Backend จะรันที่: `http://localhost:5000`

### รัน Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Frontend จะรันที่: `http://localhost:5173`

## 🔐 การสร้าง Admin Account

### วิธีที่ 1: ผ่าน API
```bash
# POST request ไปที่
POST http://localhost:5000/api/auth/register

# Body:
{
  "username": "admin",
  "email": "admin@studyhub.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

### วิธีที่ 2: แก้ไขใน Database
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@studyhub.com';
```

## 📁 โครงสร้างโปรเจค

```
studyhub-platform/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Middleware functions
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── uploads/            # Uploaded files (local)
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static files
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # TailwindCSS configuration
│   └── postcss.config.js   # PostCSS configuration
├── README.md
└── .gitignore
```

## 🛠️ Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**แก้ไข:**
- ตรวจสอบว่า MySQL รันอยู่
- ตรวจสอบ username/password ใน DATABASE_URL
- ตรวจสอบว่าฐานข้อมูล studyhub ถูกสร้างแล้ว

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**แก้ไข:**
```bash
# หา process ที่ใช้ port 5000
lsof -ti:5000

# Kill process
kill -9 <PID>
```

#### 3. Cloudinary Upload Error
**แก้ไข:**
- ตรวจสอบ API credentials
- ตรวจสอบว่าใส่ข้อมูลใน .env ถูกต้อง
- Restart server หลังแก้ไข .env

#### 4. TailwindCSS Styles ไม่ทำงาน
**แก้ไข:**
```bash
cd frontend
npm run build
npm run dev
```

#### 5. CORS Error
**แก้ไข:**
- ตรวจสอบว่า backend รันที่ port 5000
- ตรวจสอบ VITE_API_URL ใน frontend/.env

## 📝 การใช้งานพื้นฐาน

### 1. สมัครสมาชิก
- ไปที่ `http://localhost:5173/register`
- กรอกข้อมูลและสมัครสมาชิก

### 2. เข้าสู่ระบบ
- ไปที่ `http://localhost:5173/login`
- ใช้ email/password ที่สมัครไว้

### 3. สมัครเป็น Uploader
- หลังเข้าสู่ระบบ ไปที่หน้า Profile
- คลิก "สมัครเป็น Uploader"
- รอ Admin อนุมัติ

### 4. Admin Panel
- เข้าสู่ระบบด้วย Admin account
- ไปที่ `http://localhost:5173/admin`
- จัดการผู้ใช้, อนุมัติ Uploader, จัดการไฟล์

## 🔄 การอัปเดตโปรเจค

### ดึงอัปเดตล่าสุด
```bash
git pull origin main
```

### อัปเดต Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### รัน Migration ใหม่ (หากมี)
```bash
cd backend
npx prisma db push
```

## 🚀 การ Deploy (Production)

### สำหรับ Production
1. เปลี่ยน NODE_ENV เป็น "production"
2. ใช้ database ที่มีความปลอดภัยสูง
3. ใช้ JWT_SECRET ที่แข็งแรง
4. ติดตั้ง SSL certificate
5. ใช้ reverse proxy (nginx)

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาในการติดตั้งหรือใช้งาน สามารถ:
1. ตรวจสอบใน Troubleshooting section
2. ดู logs ใน terminal
3. ตรวจสอบไฟล์ .env ว่าถูกต้อง

**Happy Coding! 🎉**