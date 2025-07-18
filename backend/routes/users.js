const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { uploadImage } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(verifyToken);

// Upload avatar
router.post('/avatar', (req, res, next) => {
  uploadImage.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Avatar upload error:', err);
      return res.status(400).json({
        error: 'Upload failed',
        message: err.message || 'Failed to upload avatar'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Check if avatar was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'Upload failed',
        message: 'Avatar image is required'
      });
    }

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        userInfo: {
          update: {
            avatar: req.file.path
          }
        }
      },
      include: {
        userInfo: true
      }
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: updatedUser.userInfo.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to upload avatar'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const [uploadedSheets, orders, purchasedSheets, totalEarnings] = await Promise.all([
      // Uploaded sheets count
      prisma.sheet.count({
        where: { uploaderId: req.user.id }
      }),
      // Orders count (purchases made)
      prisma.order.count({
        where: { userId: req.user.id }
      }),
      // Purchased sheets count (confirmed orders)
      prisma.order.count({
        where: {
          userId: req.user.id,
          status: 'PAID'
        }
      }),
      // Total earnings from uploaded sheets
      prisma.order.aggregate({
        where: {
          status: 'PAID',
          sheet: {
            uploaderId: req.user.id
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Get recent activity
    const recentPurchases = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        status: 'PAID'
      },
      include: {
        sheet: {
          include: {
            uploader: {
              include: {
                uploaderProfile: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const recentUploads = await prisma.sheet.findMany({
      where: { uploaderId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        uploadedSheets,
        totalOrders: orders,
        purchasedSheets,
        totalEarnings: totalEarnings._sum.amount || 0
      },
      recentActivity: {
        purchases: recentPurchases.map(order => ({
          id: order.id,
          amount: order.amount,
          purchasedAt: order.updatedAt,
          sheet: {
            id: order.sheet.id,
            subjectName: order.sheet.subjectName,
            subjectCode: order.sheet.subjectCode,
            uploader: {
              penName: order.sheet.uploader.uploaderProfile?.penName
            }
          }
        })),
        uploads: recentUploads.map(sheet => ({
          id: sheet.id,
          subjectName: sheet.subjectName,
          subjectCode: sheet.subjectCode,
          status: sheet.status,
          price: sheet.price,
          downloadCount: sheet.downloadCount,
          createdAt: sheet.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user statistics'
    });
  }
});

// Search users (for finding uploaders, etc.)
router.get('/search', async (req, res) => {
  try {
    const search = req.query.q;
    const type = req.query.type || 'all'; // 'all', 'uploaders'

    if (!search || search.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid search',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const where = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { userInfo: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (type === 'uploaders') {
      where.uploaderProfile = {
        isApproved: true
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        userInfo: true,
        uploaderProfile: true
      },
      take: 10
    });

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.userInfo?.fullName,
        avatar: user.userInfo?.avatar,
        uploaderProfile: user.uploaderProfile ? {
          penName: user.uploaderProfile.penName,
          faculty: user.uploaderProfile.faculty,
          major: user.uploaderProfile.major,
          isApproved: user.uploaderProfile.isApproved
        } : null
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search users'
    });
  }
});

// Get user by ID (public profile view)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userInfo: true,
        uploaderProfile: true,
        _count: {
          select: {
            sheets: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Only show approved uploader profiles
    const uploaderProfile = user.uploaderProfile?.isApproved ? user.uploaderProfile : null;

    // Get user's approved sheets if uploader
    let sheets = [];
    if (uploaderProfile) {
      sheets = await prisma.sheet.findMany({
        where: {
          uploaderId: user.id,
          status: 'APPROVED'
        },
        select: {
          id: true,
          subjectName: true,
          subjectCode: true,
          faculty: true,
          major: true,
          term: true,
          shortDesc: true,
          price: true,
          downloadCount: true,
          createdAt: true,
          previewImages: true
        },
        orderBy: { createdAt: 'desc' },
        take: 12
      });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.userInfo?.fullName,
        avatar: user.userInfo?.avatar,
        uploaderProfile: uploaderProfile ? {
          penName: uploaderProfile.penName,
          faculty: uploaderProfile.faculty,
          major: uploaderProfile.major,
          year: uploaderProfile.year
        } : null,
        stats: {
          totalSheets: user._count.sheets
        },
        joinedAt: user.createdAt
      },
      sheets: sheets.map(sheet => ({
        ...sheet,
        previewImages: JSON.parse(sheet.previewImages || '[]')
      }))
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
});

// Get notifications (placeholder for future implementation)
router.get('/notifications', async (req, res) => {
  try {
    // This is a placeholder for future notification system
    // For now, we'll return recent activities as "notifications"
    
    const notifications = [];

    // Check for approved/rejected sheets
    const recentSheets = await prisma.sheet.findMany({
      where: {
        uploaderId: req.user.id,
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    recentSheets.forEach(sheet => {
      if (sheet.status === 'APPROVED') {
        notifications.push({
          id: `sheet-approved-${sheet.id}`,
          type: 'sheet_approved',
          title: 'Sheet Approved',
          message: `Your sheet "${sheet.subjectName}" has been approved`,
          createdAt: sheet.updatedAt,
          data: { sheetId: sheet.id }
        });
      } else if (sheet.status === 'REJECTED') {
        notifications.push({
          id: `sheet-rejected-${sheet.id}`,
          type: 'sheet_rejected',
          title: 'Sheet Rejected',
          message: `Your sheet "${sheet.subjectName}" has been rejected`,
          createdAt: sheet.updatedAt,
          data: { sheetId: sheet.id }
        });
      }
    });

    // Check for confirmed orders
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        status: 'PAID',
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        sheet: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    recentOrders.forEach(order => {
      notifications.push({
        id: `order-confirmed-${order.id}`,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment for "${order.sheet.subjectName}" has been confirmed`,
        createdAt: order.updatedAt,
        data: { orderId: order.id, sheetId: order.sheet.id }
      });
    });

    // Sort notifications by date
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      notifications: notifications.slice(0, 20) // Limit to 20 most recent
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get notifications'
    });
  }
});

module.exports = router;