const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@studyhub.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        userInfo: {
          create: {
            fullName: 'System Administrator'
          }
        }
      },
      include: {
        userInfo: true
      }
    });

    console.log('Admin user created:', admin.email);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  // Create sample faculties and majors data
  const sampleFaculties = [
    'Engineering',
    'Business Administration',
    'Computer Science',
    'Medicine',
    'Law',
    'Arts and Sciences'
  ];

  const sampleMajors = [
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Management',
    'Marketing',
    'Computer Science',
    'Information Technology',
    'General Medicine',
    'Law',
    'English Literature',
    'Mathematics',
    'Physics'
  ];

  console.log('Sample data available:');
  console.log('Faculties:', sampleFaculties);
  console.log('Majors:', sampleMajors);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });