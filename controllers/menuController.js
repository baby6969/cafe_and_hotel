const MenuItem = require('../models/MenuItem');
const fs = require('fs');
const path = require('path');

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items'
    });
  }
};

// Get single menu item
const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item'
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable, featured } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    const menuItemData = {
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      category,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      featured: featured !== undefined ? featured === 'true' : false
    };

    // Add image path if uploaded
    if (req.file) {
      menuItemData.image = `/uploads/${req.file.filename}`;
    }

    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating menu item'
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable, featured } = req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      // Delete uploaded file if menu item not found
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Update fields
    if (name) menuItem.name = name.trim();
    if (description !== undefined) menuItem.description = description.trim();
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable === 'true';
    if (featured !== undefined) menuItem.featured = featured === 'true';

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (menuItem.image) {
        const oldImagePath = path.join(__dirname, '..', menuItem.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
      
      menuItem.image = `/uploads/${req.file.filename}`;
    }

    await menuItem.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating menu item'
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Delete associated image
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    await MenuItem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item'
    });
  }
};

// Get menu statistics
const getMenuStats = async (req, res) => {
  try {
    const totalItems = await MenuItem.countDocuments();
    const availableItems = await MenuItem.countDocuments({ isAvailable: true });
    const featuredItems = await MenuItem.countDocuments({ featured: true });
    
    const categoryStats = await MenuItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        availableItems,
        featuredItems,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu statistics'
    });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuStats
};
