const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply to become an uploader
router.post('/apply', verifyToken, [
  body('penName').trim().isLength({ min: 2 }).withMessage('Pen name must be at least 2 characters'),
  body('faculty').trim().isLength({ min: 2 }).withMessage('Faculty is required'),
  body('major').trim().isLength({ min: 2 }).withMessage('Major is required'),
  body('year').trim().isLength({ min: 1 }).withMessage('Year is required'),
  body('phoneNumber').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('bankAccount').trim().isLength({ min: 10 }).withMessage('Bank account must be at least 10 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { penName, faculty, major, year, phoneNumber, bankAccount } = req.body;

    // Check if user already has an uploader profile
    const existingProfile = await prisma.uploaderProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (existingProfile) {
      return res.status(400).json({
        error: 'Application failed',
        message: 'You have already applied to become an uploader'
      });
    }

    // Create uploader profile
    const uploaderProfile = await prisma.uploaderProfile.create({
      data: {
        userId: req.user.id,
        penName,
        faculty,
        major,
        year,
        phoneNumber,
        bankAccount,
        isApproved: false
      }
    });

    res.status(201).json({
      message: 'Uploader application submitted successfully',
      uploaderProfile: {
        id: uploaderProfile.id,
        penName: uploaderProfile.penName,
        faculty: uploaderProfile.faculty,
        major: uploaderProfile.major,
        year: uploaderProfile.year,
        phoneNumber: uploaderProfile.phoneNumber,
        bankAccount: uploaderProfile.bankAccount,
        isApproved: uploaderProfile.isApproved,
        createdAt: uploaderProfile.createdAt
      }
    });
  } catch (error) {
    console.error('Uploader application error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit uploader application'
    });
  }
});

// Update uploader profile
router.put('/profile', verifyToken, [
  body('penName').optional().trim().isLength({ min: 2 }).withMessage('Pen name must be at least 2 characters'),
  body('faculty').optional().trim().isLength({ min: 2 }).withMessage('Faculty is required'),
  body('major').optional().trim().isLength({ min: 2 }).withMessage('Major is required'),
  body('year').optional().trim().isLength({ min: 1 }).withMessage('Year is required'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('bankAccount').optional().trim().isLength({ min: 10 }).withMessage('Bank account must be at least 10 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { penName, faculty, major, year, phoneNumber, bankAccount } = req.body;

    // Check if user has an uploader profile
    const existingProfile = await prisma.uploaderProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!existingProfile) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Uploader profile not found'
      });
    }

    // Update only provided fields
    const updateData = {};
    if (penName !== undefined) updateData.penName = penName;
    if (faculty !== undefined) updateData.faculty = faculty;
    if (major !== undefined) updateData.major = major;
    if (year !== undefined) updateData.year = year;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount;

    const updatedProfile = await prisma.uploaderProfile.update({
      where: { userId: req.user.id },
      data: updateData
    });

    res.json({
      message: 'Uploader profile updated successfully',
      uploaderProfile: {
        id: updatedProfile.id,
        penName: updatedProfile.penName,
        faculty: updatedProfile.faculty,
        major: updatedProfile.major,
        year: updatedProfile.year,
        phoneNumber: updatedProfile.phoneNumber,
        bankAccount: updatedProfile.bankAccount,
        isApproved: updatedProfile.isApproved,
        createdAt: updatedProfile.createdAt
      }
    });
  } catch (error) {
    console.error('Update uploader profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update uploader profile'
    });
  }
});

// Get all pending uploader applications (Admin only)
router.get('/pending', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [pendingApplications, total] = await Promise.all([
      prisma.uploaderProfile.findMany({
        where: { isApproved: false },
        include: {
          user: {
            include: {
              userInfo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.uploaderProfile.count({
        where: { isApproved: false }
      })
    ]);

    res.json({
      applications: pendingApplications.map(profile => ({
        id: profile.id,
        penName: profile.penName,
        faculty: profile.faculty,
        major: profile.major,
        year: profile.year,
        phoneNumber: profile.phoneNumber,
        bankAccount: profile.bankAccount,
        isApproved: profile.isApproved,
        createdAt: profile.createdAt,
        user: {
          id: profile.user.id,
          email: profile.user.email,
          fullName: profile.user.userInfo?.fullName,
          phone: profile.user.userInfo?.phone
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
    console.error('Get pending applications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get pending applications'
    });
  }
});

// Approve or reject uploader application (Admin only)
router.put('/:id/status', verifyToken, requireAdmin, [
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
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
    const { isApproved } = req.body;

    // Check if uploader profile exists
    const uploaderProfile = await prisma.uploaderProfile.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            userInfo: true
          }
        }
      }
    });

    if (!uploaderProfile) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Uploader profile not found'
      });
    }

    // Update approval status
    const updatedProfile = await prisma.uploaderProfile.update({
      where: { id },
      data: { isApproved }
    });

    res.json({
      message: `Uploader application ${isApproved ? 'approved' : 'rejected'} successfully`,
      uploaderProfile: {
        id: updatedProfile.id,
        penName: updatedProfile.penName,
        faculty: updatedProfile.faculty,
        major: updatedProfile.major,
        year: updatedProfile.year,
        phoneNumber: updatedProfile.phoneNumber,
        bankAccount: updatedProfile.bankAccount,
        isApproved: updatedProfile.isApproved,
        createdAt: updatedProfile.createdAt,
        user: {
          id: uploaderProfile.user.id,
          email: uploaderProfile.user.email,
          fullName: uploaderProfile.user.userInfo?.fullName
        }
      }
    });
  } catch (error) {
    console.error('Update uploader status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update uploader status'
    });
  }
});

// Get all approved uploaders
router.get('/approved', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [approvedUploaders, total] = await Promise.all([
      prisma.uploaderProfile.findMany({
        where: { isApproved: true },
        include: {
          user: {
            include: {
              userInfo: true,
              _count: {
                select: {
                  sheets: {
                    where: { status: 'APPROVED' }
                  }
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.uploaderProfile.count({
        where: { isApproved: true }
      })
    ]);

    res.json({
      uploaders: approvedUploaders.map(profile => ({
        id: profile.id,
        penName: profile.penName,
        faculty: profile.faculty,
        major: profile.major,
        year: profile.year,
        createdAt: profile.createdAt,
        totalSheets: profile.user._count.sheets,
        user: {
          id: profile.user.id,
          fullName: profile.user.userInfo?.fullName
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
    console.error('Get approved uploaders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get approved uploaders'
    });
  }
});

module.exports = router;