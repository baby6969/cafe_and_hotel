# 🍴 The Culinary Canvas - Professional Restaurant Website

## 🚀 Quick Start Guide

### 1. Start the Application

```bash
cd /home/yz/Documents/javascript/testing/digital-marketing/hotel
./start.sh
```

### 2. Access the Application

- **Website**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin-login.html
- **Admin Dashboard**: http://localhost:3000/admin.html

### 3. Admin Credentials

```
Email: admin@culinarycanvas.com
Password: admin123
```

## 🎯 Project Overview

This is a **professional, full-stack restaurant website** with:

- **Modern, responsive frontend** using Tailwind CSS
- **Interactive admin dashboard** for content management
- **Complete backend API** with database integration
- **Gallery management system** for homepage images
- **Menu management system** with CRUD operations
- **Professional design** based on modern UI/UX principles

## 📁 Project Structure

```
hotel/
├── frontend/                    # Frontend Website
│   ├── index.html              # Homepage with hero, menu, gallery, contact
│   ├── menu.html               # Interactive menu with filtering
│   ├── admin-login.html        # Secure admin authentication
│   ├── admin.html              # Complete admin dashboard
│   ├── js/
│   │   └── admin-dashboard.js  # Interactive admin functionality
│   └── README.md               # Frontend documentation
├── backend/                     # Backend API Server
│   ├── models/
│   │   ├── Admin.js            # Admin user model
│   │   ├── MenuItem.js         # Menu item model
│   │   └── Gallery.js          # Gallery image model
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication endpoints
│   │   ├── menuRoutes.js       # Menu CRUD endpoints
│   │   └── galleryRoutes.js    # Gallery management endpoints
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── upload.js           # File upload handling
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── config.env          # Environment variables
│   ├── uploads/                # File storage
│   │   └── gallery/            # Gallery images
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main server file
├── start.sh                     # One-click startup script
└── PROJECT_GUIDE.md            # This comprehensive guide
```

## 🌟 Key Features

### 🏠 Frontend Website Features

- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Professional Tailwind CSS styling
- **Interactive Navigation**: Smooth scrolling and active states
- **Dynamic Gallery**: Admin-managed image gallery
- **Menu Display**: Beautiful menu layout with filtering
- **Contact Information**: Professional contact section
- **SEO Optimized**: Proper meta tags and structure

### 📊 Admin Dashboard Features

- **Secure Authentication**: JWT-based login system
- **Dashboard Analytics**: Charts and statistics
- **Menu Management**: Full CRUD operations for dishes
- **Gallery Management**: Upload, edit, and organize images
- **Real-time Updates**: Changes reflect immediately
- **Professional UI**: Clean, modern admin interface
- **Mobile Responsive**: Works on all devices

### 🔧 Backend API Features

- **RESTful API**: Professional API design
- **Database Integration**: MongoDB with Mongoose
- **File Upload**: Image handling with Multer
- **Authentication**: JWT tokens with middleware
- **Error Handling**: Comprehensive error management
- **CORS Support**: Cross-origin request handling
- **Environment Config**: Secure configuration management

## 📋 API Endpoints

### Public Endpoints

```
GET    /api/health              # Health check
GET    /api/menu                # Get all menu items
GET    /api/gallery?active=true # Get active gallery images
```

### Admin Authentication

```
POST   /api/admin/login         # Admin login
GET    /api/admin/profile       # Get admin profile (protected)
```

### Menu Management (Protected)

```
GET    /api/menu                # Get all menu items
POST   /api/menu                # Create new menu item
PUT    /api/menu/:id            # Update menu item
DELETE /api/menu/:id            # Delete menu item
GET    /api/menu/stats          # Menu statistics
```

### Gallery Management (Protected)

```
GET    /api/gallery             # Get all gallery images
POST   /api/gallery             # Upload new images
PUT    /api/gallery/:id         # Update image details
DELETE /api/gallery/:id         # Delete image
GET    /api/gallery/stats       # Gallery statistics
```

## 🎨 Design System

### Color Palette

- **Primary Orange**: `#ec8013` - Main brand color
- **Secondary Cream**: `#fcfaf8` - Background color
- **Text Primary**: `#1b140d` - Dark text
- **Text Secondary**: `#9a734c` - Muted text

### Typography

- **Primary Font**: Epilogue (Modern, professional)
- **Secondary Font**: Noto Sans (Readable, clean)
- **Icons**: Material Symbols Outlined

### Components

- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Hover effects, focus states
- **Forms**: Consistent styling, validation
- **Navigation**: Smooth animations, active states

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure authentication
- **Rate Limiting**: Login attempt protection
- **Session Management**: Automatic token validation
- **Secure Logout**: Complete data cleanup

### Data Protection

- **Input Validation**: Server-side validation
- **File Upload Security**: Type and size restrictions
- **XSS Prevention**: HTML escaping
- **CORS Configuration**: Secure cross-origin requests

## 💾 Database Schema

### Admin Model

```javascript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (default: 'admin')
  createdAt: Date
  updatedAt: Date
}
```

### MenuItem Model

```javascript
{
  name: String (required)
  description: String
  price: Number (required)
  category: String (required)
  image: String (file path)
  isAvailable: Boolean (default: true)
  featured: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

### Gallery Model

```javascript
{
  title: String (required)
  description: String
  imageUrl: String (required)
  filename: String (required)
  size: Number
  mimeType: String
  isActive: Boolean (default: true)
  order: Number (default: 0)
  uploadedBy: ObjectId (ref: Admin)
  uploadedAt: Date
  updatedAt: Date
}
```

## 🧪 Testing the Application

### 1. Test Frontend

- Open http://localhost:3000
- Navigate through all sections
- Test mobile responsiveness
- Check gallery loading

### 2. Test Admin Login

- Go to http://localhost:3000/admin-login.html
- Login with admin@culinarycanvas.com / admin123
- Verify successful authentication

### 3. Test Admin Dashboard

- Access http://localhost:3000/admin.html
- Test all navigation tabs
- Upload gallery images
- Add/edit menu items
- Verify real-time updates

### 4. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get menu items
curl http://localhost:5000/api/menu

# Get gallery images
curl http://localhost:5000/api/gallery?active=true
```

## 🔧 Configuration

### Environment Variables (backend/config.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/culinary-canvas

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=24h

# Default Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@culinarycanvas.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📱 Mobile Responsiveness

The application is fully responsive and tested on:

- **Desktop**: 1920px and above
- **Laptop**: 1024px - 1919px
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

### Responsive Features

- Collapsible navigation menus
- Touch-friendly interfaces
- Optimized image loading
- Adaptive layouts
- Mobile-first design

## 🎯 Professional Features

### Frontend Excellence

- **Modern Design**: Based on professional UI/UX principles
- **Interactive Elements**: Smooth animations and transitions
- **Performance Optimized**: Fast loading and efficient code
- **SEO Ready**: Proper meta tags and structure
- **Accessibility**: WCAG guidelines compliance

### Admin Dashboard Excellence

- **Intuitive Interface**: Easy-to-use admin panel
- **Real-time Updates**: Immediate feedback and updates
- **Comprehensive Management**: Complete control over content
- **Data Visualization**: Charts and analytics
- **Professional Workflow**: Streamlined admin operations

### Backend Excellence

- **Scalable Architecture**: Professional Node.js/Express setup
- **Database Integration**: MongoDB with proper schemas
- **API Design**: RESTful endpoints with proper responses
- **Error Handling**: Comprehensive error management
- **Security**: Industry-standard security practices

## 🚀 Deployment Ready

### Production Checklist

- ✅ Environment configuration
- ✅ Database models and migrations
- ✅ API endpoint documentation
- ✅ Frontend optimization
- ✅ Security implementation
- ✅ Error handling
- ✅ Mobile responsiveness
- ✅ Cross-browser compatibility

### Deployment Steps

1. **Set up production database** (MongoDB Atlas recommended)
2. **Update environment variables** in config.env
3. **Deploy backend** to cloud service (Heroku, DigitalOcean, AWS)
4. **Deploy frontend** to static hosting (Netlify, Vercel, GitHub Pages)
5. **Update API URLs** in frontend JavaScript
6. **Test production deployment**

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**

- Check if MongoDB is running
- Verify Node.js version (16+)
- Check port 5000 availability
- Review config.env file

**Frontend won't start:**

- Check Python installation
- Try alternative: `npx serve -s . -l 3000`
- Verify port 3000 availability

**Admin login fails:**

- Check backend is running
- Verify default admin credentials
- Check browser console for errors
- Ensure CORS is properly configured

**Gallery images not loading:**

- Check uploads directory permissions
- Verify image file sizes (< 5MB)
- Check browser network tab for errors
- Ensure proper API authentication

## 📞 Support

For technical support:

1. Check browser console for errors
2. Review server logs in terminal
3. Verify all services are running
4. Test API endpoints directly

## 🎉 Success Indicators

Your application is working correctly when:

- ✅ Homepage loads with navigation and gallery
- ✅ Menu page shows interactive filtering
- ✅ Admin login accepts credentials
- ✅ Admin dashboard loads with charts
- ✅ Gallery management allows image upload
- ✅ Menu management allows CRUD operations
- ✅ All responsive breakpoints work
- ✅ API endpoints return proper responses

---

**The Culinary Canvas** - A professional, full-stack restaurant website with comprehensive content management system.

_Built with modern technologies for optimal performance and user experience._

