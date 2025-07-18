# คำสั่งด่วนสำหรับอัปโหลด StudyHub ขึ้น GitHub

## ก่อนเริ่ม
1. สร้าง repository ใหม่บน GitHub ชื่อ `studyhub-platform`
2. เปิด Terminal/Command Prompt ในโฟลเดอร์โปรเจค

## คำสั่งทั้งหมด (Copy & Paste)

```bash
# เริ่มต้น Git
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# สร้าง commit
git commit -m "Initial commit: StudyHub platform with backend and frontend - Fixed TailwindCSS issues"

# เชื่อมต่อกับ GitHub (แทน YOUR_USERNAME ด้วยชื่อผู้ใช้ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/studyhub-platform.git

# อัปโหลด
git push -u origin main
```

## หากมี Repository อยู่แล้ว (อัปเดต)

```bash
# ตรวจสอบสถานะ
git status

# เพิ่มไฟล์ที่เปลี่ยนแปลง
git add .

# สร้าง commit
git commit -m "Fix: Resolve TailwindCSS configuration and update to stable version"

# อัปโหลด
git push origin main
```

## ตรวจสอบก่อนอัปโหลด

### ไฟล์ที่ต้องมี:
- ✅ `README.md`
- ✅ `.gitignore`
- ✅ `backend/package.json`
- ✅ `frontend/package.json`
- ✅ `.env.example` (ไม่ใช่ `.env`)

### ไฟล์ที่ไม่ควรอัปโหลด:
- ❌ `node_modules/`
- ❌ `.env` (file จริง)
- ❌ `dist/` หรือ `build/`
- ❌ `*.log`

## หลังอัปโหลดเสร็จ

คุณจะได้ URL: `https://github.com/YOUR_USERNAME/studyhub-platform`

### การแชร์โปรเจค:
1. ส่ง GitHub URL ให้ผู้อื่น
2. ผู้อื่นสามารถ clone ด้วย: `git clone https://github.com/YOUR_USERNAME/studyhub-platform.git`

---

**สำคัญ**: แทนที่ `YOUR_USERNAME` ด้วยชื่อผู้ใช้ GitHub ของคุณจริง ๆ