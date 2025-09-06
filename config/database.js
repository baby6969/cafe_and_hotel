const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    // First try to connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully');
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, using local file storage');
    console.log('   Error:', error.message);
    console.log('   To use MongoDB: Install MongoDB or update MONGODB_URI in config.env');
    
    // Create local storage directory
    const storageDir = path.join(__dirname, '../storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    // Create default storage files if they don't exist
    const files = ['admins.json', 'menu.json', 'gallery.json'];
    files.forEach(file => {
      const filePath = path.join(storageDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
    
    isMongoConnected = false;
    return false;
  }
};

// Simple file storage helper
class FileStorage {
  constructor(filename) {
    this.filename = filename;
    this.filePath = path.join(__dirname, '../storage', filename);
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('File write error:', error);
      return false;
    }
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item._id === id || item.id === id);
  }

  findOne(query) {
    const data = this.read();
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  find(query = {}) {
    const data = this.read();
    if (Object.keys(query).length === 0) return data;
    
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  create(item) {
    const data = this.read();
    const newItem = {
      ...item,
      _id: item._id || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  update(id, updates) {
    const data = this.read();
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date() };
      this.write(data);
      return data[index];
    }
    return null;
  }

  delete(id) {
    const data = this.read();
    const filtered = data.filter(item => item._id !== id && item.id !== id);
    this.write(filtered);
    return filtered.length < data.length;
  }
}

// Export connection status and storage helper
module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  FileStorage
};