const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { uploadImage } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// Create order for paid sheet
router.post('/', verifyToken, [
  body('sheetId').notEmpty().withMessage('Sheet ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sheetId } = req.body;

    // Check if sheet exists and is approved
    const sheet = await prisma.sheet.findUnique({
      where: { id: sheetId },
      include: {
        uploader: {
          include: {
            uploaderProfile: true
          }
        }
      }
    });

    if (!sheet || sheet.status !== 'APPROVED') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sheet not found or not approved'
      });
    }

    // Check if sheet is free
    if (sheet.price === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'This sheet is free, no order needed'
      });
    }

    // Check if user is the uploader
    if (sheet.uploaderId === req.user.id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You cannot purchase your own sheet'
      });
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        userId_sheetId: {
          userId: req.user.id,
          sheetId: sheet.id
        }
      }
    });

    if (existingOrder) {
      return res.status(400).json({
        error: 'Order exists',
        message: 'You have already ordered this sheet',
        order: {
          id: existingOrder.id,
          status: existingOrder.status,
          amount: existingOrder.amount,
          createdAt: existingOrder.createdAt
        }
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        sheetId: sheet.id,
        amount: sheet.price,
        status: 'PENDING'
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
      }
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
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
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create order'
    });
  }
});

// Upload payment slip
router.post('/:id/payment', verifyToken, (req, res, next) => {
  uploadImage.single('paymentSlip')(req, res, (err) => {
    if (err) {
      console.error('Payment slip upload error:', err);
      return res.status(400).json({
        error: 'Upload failed',
        message: err.message || 'Failed to upload payment slip'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment slip was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'Upload failed',
        message: 'Payment slip image is required'
      });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id },
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
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only upload payment slip for your own orders'
      });
    }

    // Check if order is still pending
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Payment slip can only be uploaded for pending orders'
      });
    }

    // Update order with payment slip
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentSlipUrl: req.file.path
      }
    });

    res.json({
      message: 'Payment slip uploaded successfully',
      order: {
        id: updatedOrder.id,
        amount: updatedOrder.amount,
        status: updatedOrder.status,
        paymentSlipUrl: updatedOrder.paymentSlipUrl,
        createdAt: updatedOrder.createdAt,
        sheet: {
          id: order.sheet.id,
          subjectName: order.sheet.subjectName,
          subjectCode: order.sheet.subjectCode
        }
      }
    });
  } catch (error) {
    console.error('Upload payment slip error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to upload payment slip'
    });
  }
});

// Get user's orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status; // 'PENDING', 'PAID', 'CANCELLED'

    const where = {
      userId: req.user.id
    };

    if (status && ['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        sheet: {
          id: order.sheet.id,
          subjectName: order.sheet.subjectName,
          subjectCode: order.sheet.subjectCode,
          faculty: order.sheet.faculty,
          major: order.sheet.major,
          term: order.sheet.term,
          section: order.sheet.section,
          shortDesc: order.sheet.shortDesc,
          price: order.sheet.price,
          previewImages: JSON.parse(order.sheet.previewImages || '[]'),
          uploader: {
            penName: order.sheet.uploader.uploaderProfile?.penName
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
    console.error('Get my orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get your orders'
    });
  }
});

// Get purchased sheets (confirmed orders)
router.get('/purchased', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.order.count({
        where: {
          userId: req.user.id,
          status: 'PAID'
        }
      })
    ]);

    res.json({
      purchasedSheets: orders.map(order => ({
        orderId: order.id,
        purchasedAt: order.updatedAt,
        amount: order.amount,
        sheet: {
          id: order.sheet.id,
          subjectName: order.sheet.subjectName,
          subjectCode: order.sheet.subjectCode,
          faculty: order.sheet.faculty,
          major: order.sheet.major,
          term: order.sheet.term,
          section: order.sheet.section,
          shortDesc: order.sheet.shortDesc,
          longDesc: order.sheet.longDesc,
          price: order.sheet.price,
          pdfUrl: order.sheet.pdfUrl,
          previewImages: JSON.parse(order.sheet.previewImages || '[]'),
          downloadCount: order.sheet.downloadCount,
          uploader: {
            penName: order.sheet.uploader.uploaderProfile?.penName,
            faculty: order.sheet.uploader.uploaderProfile?.faculty,
            major: order.sheet.uploader.uploaderProfile?.major
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
    console.error('Get purchased sheets error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get purchased sheets'
    });
  }
});

// Cancel order (user can cancel pending orders)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sheet: true
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own orders'
      });
    }

    // Check if order can be cancelled
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot cancel',
        message: 'Only pending orders can be cancelled'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cancel order'
    });
  }
});

// Get single order details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sheet: {
          include: {
            uploader: {
              include: {
                uploaderProfile: true
              }
            }
          }
        },
        user: {
          include: {
            userInfo: true
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

    // Check if user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own orders'
      });
    }

    res.json({
      order: {
        id: order.id,
        amount: order.amount,
        status: order.status,
        paymentSlipUrl: order.paymentSlipUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        sheet: {
          id: order.sheet.id,
          subjectName: order.sheet.subjectName,
          subjectCode: order.sheet.subjectCode,
          faculty: order.sheet.faculty,
          major: order.sheet.major,
          term: order.sheet.term,
          section: order.sheet.section,
          shortDesc: order.sheet.shortDesc,
          price: order.sheet.price,
          previewImages: JSON.parse(order.sheet.previewImages || '[]'),
          uploader: {
            penName: order.sheet.uploader.uploaderProfile?.penName,
            bankAccount: order.sheet.uploader.uploaderProfile?.bankAccount
          }
        },
        user: {
          fullName: order.user.userInfo?.fullName,
          email: order.user.email,
          phone: order.user.userInfo?.phone
        }
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get order'
    });
  }
});

module.exports = router;