# คู่มือการอัปโหลดโปรเจค StudyHub ขึ้น GitHub

## วิธีที่ 1: สร้าง Repository ใหม่บน GitHub

### ขั้นตอนที่ 1: สร้าง Repository บน GitHub
1. เข้าไปที่ [GitHub.com](https://github.com)
2. คลิก **"New"** หรือ **"+"** แล้วเลือก **"New repository"**
3. ตั้งชื่อ repository เป็น `studyhub-platform`
4. เพิ่ม Description: `StudyHub - Platform for students to upload, download, and purchase study notes`
5. เลือก **Public** หรือ **Private** ตามต้องการ
6. ❌ **อย่าเลือก** "Add a README file", ".gitignore", "license" (เพราะเราจะอัปโหลดไฟล์ของเราเอง)
7. คลิก **"Create repository"**

### ขั้นตอนที่ 2: อัปโหลดไฟล์ผ่าน Command Line
```bash
# 1. เข้าไปในโฟลเดอร์โปรเจค
cd studyhub-platform

# 2. เริ่มต้น git repository
git init

# 3. เพิ่มไฟล์ทั้งหมด
git add .

# 4. สร้าง commit แรก
git commit -m "Initial commit: StudyHub platform with backend and frontend"

# 5. เชื่อมต่อกับ GitHub repository (แทน YOUR_USERNAME ด้วยชื่อผู้ใช้ GitHub ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/studyhub-platform.git

# 6. อัปโหลดไฟล์
git push -u origin main
```

## วิธีที่ 2: อัปโหลดผ่าน GitHub Web Interface

### สำหรับผู้ที่ไม่คุ้นเคยกับ Command Line
1. สร้าง Repository ใหม่ตามขั้นตอนด้านบน
2. คลิก **"uploading an existing file"** 
3. ลากไฟล์ทั้งหมดในโฟลเดอร์โปรเจคมาใส่ในหน้าเว็บ
4. เขียน commit message: `Initial commit: StudyHub platform`
5. คลิก **"Commit new files"**

## วิธีที่ 3: อัปเดตโปรเจคที่มีอยู่แล้ว

### หากคุณมี Repository อยู่แล้วและต้องการอัปเดต
```bash
# 1. เข้าไปในโฟลเดอร์โปรเจค
cd studyhub-platform

# 2. ตรวจสอบไฟล์ที่เปลี่ยนแปลง
git status

# 3. เพิ่มไฟล์ที่เปลี่ยนแปลง
git add .

# 4. สร้าง commit
git commit -m "Fix: Resolve TailwindCSS configuration issues and update dependencies"

# 5. อัปโหลด
git push origin main
```

## ไฟล์ที่ควรมีในโปรเจค

### Backend Files
- `server.js` - เซิร์ฟเวอร์หลัก
- `package.json` - dependencies
- `prisma/schema.prisma` - database schema
- `.env.example` - ตัวอย่าง environment variables
- `/src/routes/` - API routes
- `/src/middleware/` - middleware functions
- `/src/utils/` - utility functions

### Frontend Files
- `package.json` - dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - TailwindCSS config
- `postcss.config.js` - PostCSS config
- `/src/App.jsx` - หลักของแอป
- `/src/components/` - React components
- `/src/pages/` - หน้าเว็บต่าง ๆ
- `/src/stores/` - Zustand stores
- `/src/services/` - API services

### Root Files
- `README.md` - คู่มือการใช้งาน
- `.gitignore` - ไฟล์ที่ไม่ต้องอัปโหลด

## สิ่งสำคัญที่ต้องจำ

### 1. Environment Variables
- ❌ **อย่า** อัปโหลดไฟล์ `.env` ที่มี secret keys
- ✅ อัปโหลดเฉพาะ `.env.example` ที่เป็นตัวอย่าง

### 2. Dependencies
- ไฟล์ `node_modules/` จะถูกเพิกเฉยโดย `.gitignore`
- ผู้อื่นจะติดตั้ง dependencies ด้วย `npm install`

### 3. Build Files
- ไฟล์ที่ build แล้ว (`/dist`, `/build`) ไม่ควรอัปโหลด
- จะ build ใหม่เมื่อ deploy

## หลังจากอัปโหลดแล้ว

### 1. แชร์ Repository
- URL ของคุณจะเป็น: `https://github.com/YOUR_USERNAME/studyhub-platform`
- ส่ง link นี้ให้ผู้อื่นดูได้

### 2. Clone โปรเจค
ผู้อื่นสามารถ clone โปรเจคได้ด้วย:
```bash
git clone https://github.com/YOUR_USERNAME/studyhub-platform.git
```

### 3. Setup Instructions
ใน README.md จะมีคำแนะนำการติดตั้งให้ผู้อื่นทำตาม

## การอัปเดตในอนาคต

### เมื่อแก้ไขโค้ด
```bash
git add .
git commit -m "Update: คำอธิบายการเปลี่ยนแปลง"
git push origin main
```

### สร้าง Branch สำหรับฟีเจอร์ใหม่
```bash
git checkout -b feature/new-feature
# แก้ไขโค้ด
git add .
git commit -m "Add: ฟีเจอร์ใหม่"
git push origin feature/new-feature
```

## Troubleshooting

### หากเกิดข้อผิดพลาด
1. ตรวจสอบว่าชื่อ repository ถูกต้อง
2. ตรวจสอบสิทธิ์ในการเข้าถึง GitHub
3. ตรวจสอบว่าไฟล์ `.gitignore` ถูกต้อง

### หากต้องการลบไฟล์ที่อัปโหลดผิด
```bash
git rm filename
git commit -m "Remove: ลบไฟล์ที่ไม่ต้องการ"
git push origin main
```

---

**หมายเหตุ**: แทนที่ `YOUR_USERNAME` ด้วยชื่อผู้ใช้ GitHub ของคุณในคำสั่งทั้งหมด