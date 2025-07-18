const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireUploader, optionalAuth } = require('../middleware/auth');
const { uploadPdf, uploadMultipleImages } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// Upload a new sheet (Uploader only)
router.post('/upload', verifyToken, requireUploader, (req, res, next) => {
  // Configure multer for this specific route
  const upload = uploadPdf.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'previewImages', maxCount: 5 }
  ]);
  
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: 'Upload failed',
        message: err.message || 'Failed to upload files'
      });
    }
    next();
  });
}, [
  body('subjectName').trim().isLength({ min: 2 }).withMessage('Subject name must be at least 2 characters'),
  body('subjectCode').trim().isLength({ min: 2 }).withMessage('Subject code is required'),
  body('faculty').trim().isLength({ min: 2 }).withMessage('Faculty is required'),
  body('major').trim().isLength({ min: 2 }).withMessage('Major is required'),
  body('term').trim().isLength({ min: 1 }).withMessage('Term is required'),
  body('section').trim().isLength({ min: 1 }).withMessage('Section is required'),
  body('shortDesc').trim().isLength({ min: 10 }).withMessage('Short description must be at least 10 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      subjectName,
      subjectCode,
      faculty,
      major,
      term,
      section,
      shortDesc,
      longDesc,
      price
    } = req.body;

    // Check if PDF was uploaded
    if (!req.files || !req.files.pdf || req.files.pdf.length === 0) {
      return res.status(400).json({
        error: 'Upload failed',
        message: 'PDF file is required'
      });
    }

    const pdfFile = req.files.pdf[0];
    const previewImages = req.files.previewImages || [];

    // Prepare preview images URLs
    const previewImageUrls = previewImages.map(file => file.path);

    // Create sheet record
    const sheet = await prisma.sheet.create({
      data: {
        uploaderId: req.user.id,
        subjectName,
        subjectCode,
        faculty,
        major,
        term,
        section,
        shortDesc,
        longDesc: longDesc || null,
        price: parseFloat(price),
        pdfUrl: pdfFile.path,
        previewImages: JSON.stringify(previewImageUrls),
        status: 'PENDING'
      },
      include: {
        uploader: {
          include: {
            userInfo: true,
            uploaderProfile: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Sheet uploaded successfully',
      sheet: {
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
        downloadCount: sheet.downloadCount,
        createdAt: sheet.createdAt,
        uploader: {
          penName: sheet.uploader.uploaderProfile?.penName,
          faculty: sheet.uploader.uploaderProfile?.faculty,
          major: sheet.uploader.uploaderProfile?.major
        }
      }
    });
  } catch (error) {
    console.error('Sheet upload error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to upload sheet'
    });
  }
});

// Get all approved sheets (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Filters
    const faculty = req.query.faculty;
    const major = req.query.major;
    const term = req.query.term;
    const search = req.query.search;
    const priceFilter = req.query.price; // 'free', 'paid', or undefined for all
    const sortBy = req.query.sortBy || 'newest'; // 'newest', 'oldest', 'price_low', 'price_high', 'popular'

    // Build where clause
    const where = {
      status: 'APPROVED'
    };

    if (faculty) where.faculty = { contains: faculty, mode: 'insensitive' };
    if (major) where.major = { contains: major, mode: 'insensitive' };
    if (term) where.term = { contains: term, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectCode: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (priceFilter === 'free') where.price = 0;
    if (priceFilter === 'paid') where.price = { gt: 0 };

    // Build order clause
    let orderBy = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { downloadCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [sheets, total] = await Promise.all([
      prisma.sheet.findMany({
        where,
        include: {
          uploader: {
            include: {
              uploaderProfile: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
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
        previewImages: JSON.parse(sheet.previewImages || '[]'),
        downloadCount: sheet.downloadCount,
        createdAt: sheet.createdAt,
        uploader: {
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
    console.error('Get sheets error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get sheets'
    });
  }
});

// Get sheet by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

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

    // Only show approved sheets to non-owners
    if (sheet.status !== 'APPROVED' && (!req.user || req.user.id !== sheet.uploaderId)) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sheet not found'
      });
    }

    // Check if user has purchased this sheet
    let hasPurchased = false;
    if (req.user && sheet.price > 0) {
      const order = await prisma.order.findUnique({
        where: {
          userId_sheetId: {
            userId: req.user.id,
            sheetId: sheet.id
          }
        }
      });
      hasPurchased = order && order.status === 'PAID';
    }

    res.json({
      sheet: {
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
        pdfUrl: sheet.price === 0 || hasPurchased || (req.user && req.user.id === sheet.uploaderId) ? sheet.pdfUrl : null,
        previewImages: JSON.parse(sheet.previewImages || '[]'),
        status: sheet.status,
        downloadCount: sheet.downloadCount,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt,
        uploader: {
          penName: sheet.uploader.uploaderProfile?.penName,
          faculty: sheet.uploader.uploaderProfile?.faculty,
          major: sheet.uploader.uploaderProfile?.major,
          year: sheet.uploader.uploaderProfile?.year
        },
        hasPurchased
      }
    });
  } catch (error) {
    console.error('Get sheet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get sheet'
    });
  }
});

// Download sheet (free or purchased)
router.post('/:id/download', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sheet = await prisma.sheet.findUnique({
      where: { id },
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
        message: 'Sheet not found'
      });
    }

    // Check if user can download
    let canDownload = false;
    
    if (sheet.price === 0) {
      // Free sheet
      canDownload = true;
    } else if (req.user.id === sheet.uploaderId) {
      // Owner can always download
      canDownload = true;
    } else {
      // Check if user has purchased and payment is confirmed
      const order = await prisma.order.findUnique({
        where: {
          userId_sheetId: {
            userId: req.user.id,
            sheetId: sheet.id
          }
        }
      });
      canDownload = order && order.status === 'PAID';
    }

    if (!canDownload) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You need to purchase this sheet to download'
      });
    }

    // Increment download count
    await prisma.sheet.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    });

    res.json({
      message: 'Download authorized',
      downloadUrl: sheet.pdfUrl,
      sheet: {
        id: sheet.id,
        subjectName: sheet.subjectName,
        subjectCode: sheet.subjectCode
      }
    });
  } catch (error) {
    console.error('Download sheet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to download sheet'
    });
  }
});

// Get user's uploaded sheets
router.get('/my/uploads', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sheets, total] = await Promise.all([
      prisma.sheet.findMany({
        where: { uploaderId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              orders: {
                where: { status: 'PAID' }
              }
            }
          }
        }
      }),
      prisma.sheet.count({
        where: { uploaderId: req.user.id }
      })
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
        previewImages: JSON.parse(sheet.previewImages || '[]'),
        status: sheet.status,
        downloadCount: sheet.downloadCount,
        salesCount: sheet._count.orders,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
  } catch (error) {
    console.error('Get my uploads error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get your uploaded sheets'
    });
  }
});

// Update sheet (owner only)
router.put('/:id', verifyToken, [
  body('subjectName').optional().trim().isLength({ min: 2 }).withMessage('Subject name must be at least 2 characters'),
  body('subjectCode').optional().trim().isLength({ min: 2 }).withMessage('Subject code is required'),
  body('faculty').optional().trim().isLength({ min: 2 }).withMessage('Faculty is required'),
  body('major').optional().trim().isLength({ min: 2 }).withMessage('Major is required'),
  body('term').optional().trim().isLength({ min: 1 }).withMessage('Term is required'),
  body('section').optional().trim().isLength({ min: 1 }).withMessage('Section is required'),
  body('shortDesc').optional().trim().isLength({ min: 10 }).withMessage('Short description must be at least 10 characters'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
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
    const updateData = req.body;

    // Check if sheet exists and user owns it
    const sheet = await prisma.sheet.findUnique({
      where: { id }
    });

    if (!sheet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sheet not found'
      });
    }

    if (sheet.uploaderId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own sheets'
      });
    }

    // Update sheet
    const updatedSheet = await prisma.sheet.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        status: 'PENDING' // Reset to pending after update
      }
    });

    res.json({
      message: 'Sheet updated successfully',
      sheet: {
        id: updatedSheet.id,
        subjectName: updatedSheet.subjectName,
        subjectCode: updatedSheet.subjectCode,
        faculty: updatedSheet.faculty,
        major: updatedSheet.major,
        term: updatedSheet.term,
        section: updatedSheet.section,
        shortDesc: updatedSheet.shortDesc,
        longDesc: updatedSheet.longDesc,
        price: updatedSheet.price,
        status: updatedSheet.status,
        updatedAt: updatedSheet.updatedAt
      }
    });
  } catch (error) {
    console.error('Update sheet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update sheet'
    });
  }
});

// Delete sheet (owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sheet exists and user owns it
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

    if (sheet.uploaderId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own sheets'
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

module.exports = router;