const express = require('express');
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuStats
} = require('../controllers/menuController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/stats', getMenuStats);
router.get('/:id', getMenuItem);

// Protected routes (admin only)
router.post('/', 
  authenticateToken, 
  upload.single('image'),
  handleUploadError,
  createMenuItem
);

router.put('/:id', 
  authenticateToken,
  upload.single('image'),
  handleUploadError,
  updateMenuItem
);

router.delete('/:id', authenticateToken, deleteMenuItem);

module.exports = router;
