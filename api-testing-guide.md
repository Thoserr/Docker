# 🧪 คู่มือการทดสอบ API Register - StudyHub

## 📋 สิ่งที่ต้องเตรียมก่อนทดสอบ

### 1. ตรวจสอบ Backend Server
- ✅ Backend รันที่ `http://localhost:5000`
- ✅ Database เชื่อมต่อสำเร็จ
- ✅ Prisma migration เสร็จแล้ว

### 2. Tools สำหรับทดสอบ
- **Postman** (แนะนำ)
- **cURL** (Command Line)
- **Thunder Client** (VS Code Extension)
- **Insomnia**
- **Browser Developer Tools**

## 🚀 วิธีการทดสอบ API Register

### 📝 ข้อมูล API Endpoint

```
Method: POST
URL: http://localhost:5000/api/auth/register
Content-Type: application/json
```

### 📦 Request Body Format

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

## 🧪 วิธีทดสอบแต่ละแบบ

### 1. ทดสอบด้วย Postman

#### ขั้นตอนที่ 1: สร้าง Request ใหม่
1. เปิด Postman
2. คลิก **"New"** > **"Request"**
3. ตั้งชื่อ: `Register User Test`
4. เลือก Collection หรือสร้างใหม่

#### ขั้นตอนที่ 2: ตั้งค่า Request
1. **Method**: เลือก `POST`
2. **URL**: ใส่ `http://localhost:5000/api/auth/register`
3. **Headers**: เพิ่ม
   ```
   Key: Content-Type
   Value: application/json
   ```

#### ขั้นตอนที่ 3: เพิ่ม Request Body
1. คลิกแท็บ **"Body"**
2. เลือก **"raw"**
3. เลือก **"JSON"** จาก dropdown
4. ใส่ข้อมูลทดสอบ:

```json
{
  "username": "testuser01",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### ขั้นตอนที่ 4: ส่ง Request
1. คลิก **"Send"**
2. ดูผลลัพธ์ใน Response

### 2. ทดสอบด้วย cURL

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser01",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 3. ทดสอบด้วย JavaScript (Browser Console)

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser01',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 4. ทดสอบด้วย Python

```python
import requests
import json

url = "http://localhost:5000/api/auth/register"
headers = {
    "Content-Type": "application/json"
}
data = {
    "username": "testuser01",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
```

## ✅ ผลลัพธ์ที่คาดหวัง

### สำเร็จ (Status 201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser01",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ข้อมูลซ้ำ (Status 400)
```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

### ข้อมูลไม่ครบ (Status 400)
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### Email ไม่ถูกต้อง (Status 400)
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### รหัสผ่านสั้นเกินไป (Status 400)
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

## 🧪 Test Cases ที่ควรทดสอบ

### 1. ✅ Happy Path - ข้อมูลถูกต้องครบถ้วน

```json
{
  "username": "validuser",
  "email": "valid@email.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**คาดหวัง**: Status 201, ได้ user object และ JWT token

### 2. ❌ Username ซ้ำ

```json
{
  "username": "validuser",
  "email": "different@email.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```
**คาดหวัง**: Status 400, "Username already exists"

### 3. ❌ Email ซ้ำ

```json
{
  "username": "differentuser",
  "email": "valid@email.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```
**คาดหวัง**: Status 400, "Email already exists"

### 4. ❌ ข้อมูลไม่ครบ

```json
{
  "username": "testuser",
  "email": "test@email.com"
}
```
**คาดหวัง**: Status 400, "All fields are required"

### 5. ❌ Email Format ผิด

```json
{
  "username": "testuser",
  "email": "invalid-email",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**คาดหวัง**: Status 400, "Invalid email format"

### 6. ❌ Password สั้นเกินไป

```json
{
  "username": "testuser",
  "email": "test@email.com",
  "password": "123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**คาดหวัง**: Status 400, "Password must be at least 6 characters"

### 7. ❌ Username มีอักขระพิเศษ

```json
{
  "username": "test@user!",
  "email": "test@email.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**คาดหวัง**: Status 400, "Invalid username format"

## 🔧 วิธีดูข้อมูลในฐานข้อมูล

### ใช้ Prisma Studio
```bash
cd backend
npx prisma studio
```

### ใช้ MySQL Command
```sql
USE studyhub;
SELECT * FROM User;
SELECT * FROM UserInfo;
```

## 🐛 Troubleshooting

### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**แก้ไข**: ตรวจสอบว่า backend server รันอยู่

### 2. CORS Error
```
Access to fetch at 'http://localhost:5000' from origin 'null' has been blocked by CORS policy
```
**แก้ไข**: ตรวจสอบ CORS configuration ใน backend

### 3. Database Error
```
Error: Can't reach database server
```
**แก้ไข**: ตรวจสอบ MySQL service และ DATABASE_URL

### 4. Internal Server Error (500)
**แก้ไข**: ดู logs ใน backend terminal และตรวจสอบ:
- Database connection
- Environment variables
- Prisma schema

## 📊 การทดสอบแบบ Automated

### Jest Test Example
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/register', () => {
  test('Should register user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.token).toBeDefined();
  });

  test('Should reject duplicate email', async () => {
    const userData = {
      username: 'testuser2',
      email: 'test@example.com', // Same email
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

## 📝 เคล็ดลับการทดสอบ

### 1. ใช้ข้อมูลที่แตกต่างกันในแต่ละครั้ง
```javascript
const timestamp = Date.now();
const testData = {
  username: `user${timestamp}`,
  email: `test${timestamp}@example.com`,
  // ...
};
```

### 2. ทดสอบ Edge Cases
- String ว่าง
- null values
- Very long strings
- Special characters

### 3. ทดสอบ Security
- SQL Injection attempts
- XSS attempts
- Very long passwords

### 4. Performance Testing
- ทดสอบการสมัครสมาชิกพร้อมกันหลายคน
- Load testing

---

## 🎯 สรุป

การทดสอบ API Register ควรครอบคลุม:
1. ✅ Happy path scenarios
2. ❌ Error scenarios
3. 🔒 Security scenarios
4. 🚀 Performance scenarios

**เคล็ดลับ**: เริ่มจาก happy path ก่อน แล้วค่อยทดสอบ edge cases และ error scenarios ตามมา

Happy Testing! 🧪✨