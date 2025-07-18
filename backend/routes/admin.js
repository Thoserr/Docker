const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(verifyToken, requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalSheets,
      totalOrders,
      totalRevenue,
      pendingSheets,
      pendingOrders,
      pendingUploaders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sheet.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      }),
      prisma.sheet.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.uploaderProfile.count({ where: { isApproved: false } })
    ]);

    // Recent activities
    const recentSheets = await prisma.sheet.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          include: {
            uploaderProfile: true
          }
        }
      }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            userInfo: true
          }
        },
        sheet: true
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalSheets,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingSheets,
        pendingOrders,
        pendingUploaders
      },
      recentActivities: {
        sheets: recentSheets.map(sheet => ({
          id: sheet.id,
          subjectName: sheet.subjectName,
          status: sheet.status,
          price: sheet.price,
          createdAt: sheet.createdAt,
          uploader: {
            penName: sheet.uploader.uploaderProfile?.penName
          }
        })),
        orders: recentOrders.map(order => ({
          id: order.id,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt,
          user: {
            fullName: order.user.userInfo?.fullName
          },
          sheet: {
            subjectName: order.sheet.subjectName
          }
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get dashboard data'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userInfo: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (role && ['USER', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userInfo: true,
          uploaderProfile: true,
          _count: {
            select: {
              sheets: true,
              orders: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.userInfo?.fullName,
        phone: user.userInfo?.phone,
        avatar: user.userInfo?.avatar,
        uploaderProfile: user.uploaderProfile ? {
          id: user.uploaderProfile.id,
          penName: user.uploaderProfile.penName,
          isApproved: user.uploaderProfile.isApproved
        } : null,
        stats: {
          totalSheets: user._count.sheets,
          totalOrders: user._count.orders
        },
        createdAt: user.createdAt
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get users'
    });
  }
});

// Get pending sheets for approval
router.get('/sheets/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sheets, total] = await Promise.all([
      prisma.sheet.findMany({
        where: { status: 'PENDING' },
        include: {
          uploader: {
            include: {
              userInfo: true,
              uploaderProfile: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sheet.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      sheets: sheets.map(sheet => ({
        id: sheet.id,
        subjectName: sheet.subjectName,
        subjectCode: sheet.subjectCode,
        faculty: sheet.faculty,
        major: sheet.major,
        term: sheet.term,
        section: sheet.section,
        shortDesc: sheet.shortDesc,
        longDesc: sheet.longDesc,
        price: sheet.price,
        pdfUrl: sheet.pdfUrl,
        previewImages: JSON.parse(sheet.previewImages || '[]'),
        status: sheet.status,
        createdAt: sheet.createdAt,
        uploader: {
          id: sheet.uploader.id,
          email: sheet.uploader.email,
          fullName: sheet.uploader.userInfo?.fullName,
          penName: sheet.uploader.uploaderProfile?.penName,
          faculty: sheet.uploader.uploaderProfile?.faculty,
          major: sheet.uploader.uploaderProfile?.major
        }
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
  } catch (error) {
    console.error('Get pending sheets error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get pending sheets'
    });
  }
});

// Approve or reject sheet
router.put('/sheets/:id/status', [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('rejectionReason').optional().trim().isLength({ min: 1 }).withMessage('Rejection reason is required when rejecting'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Check if sheet exists
    const sheet = await prisma.sheet.findUnique({
      where: { id },
      include: {
        uploader: {
          include: {
            userInfo: true,
            uploaderProfile: true
          }
        }
      }
    });

    if (!sheet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sheet not found'
      });
    }

    if (sheet.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Only pending sheets can be approved or rejected'
      });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Rejection reason is required when rejecting a sheet'
      });
    }

    // Update sheet status
    const updatedSheet = await prisma.sheet.update({
      where: { id },
      data: { status }
    });

    // TODO: Send notification to uploader about approval/rejection
    // This could be implemented with email service or in-app notifications

    res.json({
      message: `Sheet ${status.toLowerCase()} successfully`,
      sheet: {
        id: updatedSheet.id,
        subjectName: updatedSheet.subjectName,
        status: updatedSheet.status,
        updatedAt: updatedSheet.updatedAt,
        uploader: {
          fullName: sheet.uploader.userInfo?.fullName,
          penName: sheet.uploader.uploaderProfile?.penName
        }
      }
    });
  } catch (error) {
    console.error('Update sheet status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update sheet status'
    });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const where = {};
    if (status && ['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            include: {
              userInfo: true
            }
          },
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        amount: order.amount,
        status: order.status,
        paymentSlipUrl: order.paymentSlipUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: {
          id: order.user.id,
          email: order.user.email,
          fullName: order.user.userInfo?.fullName,
          phone: order.user.userInfo?.phone
        },
        sheet: {
          id: order.sheet.id,
          subjectName: order.sheet.subjectName,
          subjectCode: order.sheet.subjectCode,
          price: order.sheet.price,
          uploader: {
            penName: order.sheet.uploader.uploaderProfile?.penName,
            bankAccount: order.sheet.uploader.uploaderProfile?.bankAccount
          }
        }
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get orders'
    });
  }
});

// Confirm payment (mark order as paid)
router.put('/orders/:id/confirm-payment', async (req, res) => {
  try {
    const { id } = req.params;

    // Find order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            userInfo: true
          }
        },
        sheet: {
          include: {
            uploader: {
              include: {
                uploaderProfile: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Only pending orders can be confirmed'
      });
    }

    if (!order.paymentSlipUrl) {
      return res.status(400).json({
        error: 'No payment slip',
        message: 'Payment slip must be uploaded before confirmation'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'PAID' }
    });

    res.json({
      message: 'Payment confirmed successfully',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
        user: {
          fullName: order.user.userInfo?.fullName
        },
        sheet: {
          subjectName: order.sheet.subjectName
        }
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to confirm payment'
    });
  }
});

// Get all sheets (admin view)
router.get('/sheets', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    const where = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectCode: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [sheets, total] = await Promise.all([
      prisma.sheet.findMany({
        where,
        include: {
          uploader: {
            include: {
              userInfo: true,
              uploaderProfile: true
            }
          },
          _count: {
            select: {
              orders: {
                where: { status: 'PAID' }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sheet.count({ where })
    ]);

    res.json({
      sheets: sheets.map(sheet => ({
        id: sheet.id,
        subjectName: sheet.subjectName,
        subjectCode: sheet.subjectCode,
        faculty: sheet.faculty,
        major: sheet.major,
        term: sheet.term,
        section: sheet.section,
        shortDesc: sheet.shortDesc,
        price: sheet.price,
        status: sheet.status,
        downloadCount: sheet.downloadCount,
        salesCount: sheet._count.orders,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt,
        uploader: {
          id: sheet.uploader.id,
          email: sheet.uploader.email,
          fullName: sheet.uploader.userInfo?.fullName,
          penName: sheet.uploader.uploaderProfile?.penName
        }
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
  } catch (error) {
    console.error('Get all sheets error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get sheets'
    });
  }
});

// Delete sheet (admin only)
router.delete('/sheets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sheet exists
    const sheet = await prisma.sheet.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!sheet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sheet not found'
      });
    }

    // Check if sheet has orders
    if (sheet._count.orders > 0) {
      return res.status(400).json({
        error: 'Cannot delete',
        message: 'Cannot delete sheet that has orders'
      });
    }

    // Delete sheet
    await prisma.sheet.delete({
      where: { id }
    });

    res.json({
      message: 'Sheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete sheet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete sheet'
    });
  }
});

// Update user role
router.put('/users/:id/role', [
  body('role').isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userInfo: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot modify',
        message: 'You cannot change your own role'
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: user.userInfo?.fullName
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user role'
    });
  }
});

module.exports = router;