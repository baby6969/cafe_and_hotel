const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/gallery');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// @route   GET /api/gallery
// @desc    Get all gallery images (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') {
      query.isActive = true;
    }
    
    const images = await Gallery.find(query)
      .sort({ order: 1, uploadedAt: -1 })
      .populate('uploadedBy', 'username email')
      .lean();
    
    // Transform for frontend
    const transformedImages = images.map(image => ({
      id: image._id,
      title: image.title,
      description: image.description,
      url: `/uploads/gallery/${image.filename}`,
      isActive: image.isActive,
      order: image.order,
      uploadedAt: image.uploadedAt,
      uploadedBy: image.uploadedBy ? {
        username: image.uploadedBy.username,
        email: image.uploadedBy.email
      } : null
    }));
    
    res.json({
      success: true,
      count: transformedImages.length,
      data: transformedImages
    });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images'
    });
  }
});

// @route   POST /api/gallery
// @desc    Upload new gallery images
// @access  Private (Admin only)
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }
    
    const uploadedImages = [];
    
    for (const file of req.files) {
      const galleryImage = new Gallery({
        title: req.body.title || file.originalname.replace(/\.[^/.]+$/, ""),
        description: req.body.description || '',
        imageUrl: `/uploads/gallery/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        isActive: req.body.isActive !== 'false',
        order: req.body.order || 0,
        uploadedBy: req.admin.id
      });
      
      await galleryImage.save();
      
      uploadedImages.push({
        id: galleryImage._id,
        title: galleryImage.title,
        description: galleryImage.description,
        url: galleryImage.imageUrl,
        isActive: galleryImage.isActive,
        order: galleryImage.order
      });
    }
    
    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/gallery', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images'
    });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image details
// @access  Private (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, isActive, order } = req.body;
    
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    // Update fields
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (isActive !== undefined) image.isActive = isActive;
    if (order !== undefined) image.order = order;
    
    await image.save();
    
    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: {
        id: image._id,
        title: image.title,
        description: image.description,
        url: image.imageUrl,
        isActive: image.isActive,
        order: image.order
      }
    });
  } catch (error) {
    console.error('Gallery update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gallery image'
    });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads/gallery', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery image'
    });
  }
});

// @route   POST /api/gallery/reorder
// @desc    Reorder gallery images
// @access  Private (Admin only)
router.post('/reorder', authenticateToken, async (req, res) => {
  try {
    const { imageOrders } = req.body; // Array of { id, order }
    
    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reorder data'
      });
    }
    
    // Update all image orders
    const updatePromises = imageOrders.map(({ id, order }) => 
      Gallery.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Gallery order updated successfully'
    });
  } catch (error) {
    console.error('Gallery reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering gallery images'
    });
  }
});

// @route   GET /api/gallery/stats
// @desc    Get gallery statistics
// @access  Private (Admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalImages = await Gallery.countDocuments();
    const activeImages = await Gallery.countDocuments({ isActive: true });
    const inactiveImages = totalImages - activeImages;
    
    // Calculate total storage used
    const images = await Gallery.find({}, 'size').lean();
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
    
    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = await Gallery.countDocuments({
      uploadedAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      data: {
        totalImages,
        activeImages,
        inactiveImages,
        totalSize,
        recentUploads,
        averageSize: totalImages > 0 ? Math.round(totalSize / totalImages) : 0
      }
    });
  } catch (error) {
    console.error('Gallery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery statistics'
    });
  }
});

module.exports = router;

