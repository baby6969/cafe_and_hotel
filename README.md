# 🍴 The Culinary Canvas - Professional Restaurant Website

## 🎯 Overview

**The Culinary Canvas** is a professional, full-stack restaurant website with comprehensive admin dashboard. Built with modern technologies and professional design principles, it provides everything needed for a restaurant's online presence.

## ✨ Features

### 🌐 Frontend Website

- **Modern Responsive Design** - Beautiful, mobile-first interface
- **Interactive Navigation** - Smooth scrolling with active states
- **Dynamic Gallery** - Admin-managed image gallery with lightbox
- **Professional Menu Display** - Category-based filtering and search
- **Contact Integration** - Phone, email, and location information
- **SEO Optimized** - Proper meta tags and structured data

### 📊 Admin Dashboard

- **Secure Authentication** - JWT-based login with rate limiting
- **Menu Management** - Full CRUD operations for dishes
- **Gallery Management** - Upload, edit, and organize images
- **Analytics Dashboard** - Charts showing website metrics
- **Settings Panel** - Restaurant information management
- **Real-time Updates** - Changes reflect immediately on website

### 🔧 Backend API

- **RESTful API** - Professional API design with proper responses
- **Database Integration** - MongoDB with Mongoose ODM
- **File Upload** - Secure image handling with validation
- **Authentication** - JWT tokens with middleware protection
- **Error Handling** - Comprehensive error management
- **CORS Support** - Cross-origin request handling

## 🚀 Quick Start

### 1. One-Click Startup

```bash
cd /home/yz/Documents/javascript/testing/digital-marketing/hotel
./start.sh
```

### 2. Access the Application

- **🏠 Website**: http://localhost:3000
- **🔐 Admin Login**: http://localhost:3000/admin-login.html
- **📊 Admin Dashboard**: http://localhost:3000/admin.html
- **📡 API Documentation**: http://localhost:5000

### 3. Admin Credentials

```
Email: admin@culinarycanvas.com (or just 'admin')
Password: admin123
```

## 📱 Screenshots & Demo

### Homepage

- Hero section with stunning background
- Featured dishes with hover effects
- Interactive gallery with lightbox
- Professional contact section

### Menu Page

- Category-based filtering
- Beautiful dish cards with descriptions
- Responsive grid layout
- Professional typography

### Admin Dashboard

- Modern sidebar navigation
- Interactive charts and analytics
- Drag & drop image upload
- Real-time menu management

## 🛠️ Technology Stack

### Frontend

- **HTML5** - Semantic markup
- **Tailwind CSS** - Modern utility-first styling
- **Vanilla JavaScript** - Clean, performant interactions
- **Material Symbols** - Consistent iconography

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object modeling for MongoDB
- **Multer** - File upload middleware
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Development Tools

- **Chart.js** - Data visualization
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
hotel/
├── frontend/                    # Frontend Application
│   ├── index.html              # Homepage
│   ├── menu.html               # Menu page with filtering
│   ├── admin-login.html        # Secure admin login
│   ├── admin.html              # Admin dashboard
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
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── upload.js           # File upload middleware
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── config.env          # Environment configuration
│   ├── uploads/
│   │   ├── gallery/            # Gallery image storage
│   │   └── menu/               # Menu image storage
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main server file
├── start.sh                     # One-click startup script
├── PROJECT_GUIDE.md            # Comprehensive project guide
└── README.md                   # This file
```

## 🔗 API Endpoints

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
POST   /api/admin/forgot-password # Password reset
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
POST   /api/gallery             # Upload new images (multipart/form-data)
PUT    /api/gallery/:id         # Update image details
DELETE /api/gallery/:id         # Delete image
GET    /api/gallery/stats       # Gallery statistics
POST   /api/gallery/reorder     # Reorder gallery images
```

## 🎨 Design System

### Color Palette

```css
:root {
  --primary-color: #ec8013; /* Orange - Primary brand color */
  --secondary-color: #fcfaf8; /* Cream - Background color */
  --text-primary: #1b140d; /* Dark brown - Headings */
  --text-secondary: #9a734c; /* Medium brown - Body text */
}
```

### Typography

- **Headings**: Epilogue (Bold, Black weights)
- **Body**: Epilogue and Noto Sans
- **Icons**: Material Symbols Outlined

### Components

- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Consistent styling, hover states, focus rings
- **Forms**: Professional inputs with validation states
- **Navigation**: Smooth animations, active indicators

## 🔐 Security Features

### Authentication

- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - Login attempt protection
- **Session Management** - Automatic token validation

### Data Protection

- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - Type and size restrictions
- **XSS Prevention** - HTML escaping and sanitization
- **CORS Configuration** - Secure cross-origin requests

### Admin Security

- **Protected Routes** - Authentication middleware
- **Role-based Access** - Admin-only functionality
- **Audit Logging** - Track admin actions
- **Secure Logout** - Complete session cleanup

## 📊 Admin Dashboard Features

### Dashboard Overview

- **Analytics Charts** - Website visits and order statistics
- **Key Metrics** - Revenue, orders, active dishes, gallery images
- **Recent Activity** - Timeline of admin actions
- **Real-time Updates** - Live data refresh

### Menu Management

- **Add/Edit Dishes** - Complete menu item management
- **Category Organization** - Organize dishes by type
- **Image Upload** - Dish photography with preview
- **Availability Toggle** - Enable/disable items
- **Featured Items** - Highlight special dishes
- **Search & Filter** - Find items quickly

### Gallery Management

- **Drag & Drop Upload** - Modern file upload interface
- **Image Editing** - Edit titles, descriptions, visibility
- **Storage Management** - Track file sizes and usage
- **Bulk Operations** - Manage multiple images
- **Website Integration** - Changes appear immediately
- **Image Preview** - Full-size image viewing

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

### Mobile Features

- **Touch-friendly interfaces** - 44px minimum touch targets
- **Collapsible navigation** - Space-efficient mobile menus
- **Optimized layouts** - Stacked content for small screens
- **Fast loading** - Optimized images and assets

## 🧪 Testing

### Manual Testing Checklist

#### Frontend

- [ ] Homepage loads with all sections
- [ ] Navigation works on all devices
- [ ] Gallery lightbox functions correctly
- [ ] Menu page filtering works
- [ ] Mobile menu toggles properly
- [ ] All links and buttons work

#### Admin Dashboard

- [ ] Login page accepts credentials
- [ ] Dashboard loads with charts
- [ ] Menu management CRUD operations work
- [ ] Gallery upload and management works
- [ ] Settings can be saved
- [ ] Logout functions properly

#### API Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test menu endpoint
curl http://localhost:5000/api/menu

# Test gallery endpoint
curl http://localhost:5000/api/gallery?active=true
```

## 🚀 Deployment

### Production Deployment

1. **Database Setup**

   - Set up MongoDB Atlas or local MongoDB
   - Update MONGODB_URI in config.env

2. **Backend Deployment** (Heroku, DigitalOcean, AWS)

   ```bash
   # Update environment variables
   # Deploy backend to cloud service
   # Update API_BASE_URL in frontend
   ```

3. **Frontend Deployment** (Netlify, Vercel, GitHub Pages)
   ```bash
   # Update API URLs in JavaScript files
   # Deploy to static hosting service
   ```

### Environment Configuration

**Development**

```env
MONGODB_URI=mongodb://localhost:27017/culinary-canvas
FRONTEND_URL=http://localhost:3000
```

**Production**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/culinary-canvas
FRONTEND_URL=https://your-domain.com
```

## 🔧 Maintenance

### Regular Tasks

- **Content Updates** - Use admin dashboard for menu and gallery
- **Backup Database** - Regular MongoDB backups
- **Monitor Performance** - Check analytics dashboard
- **Security Updates** - Keep dependencies current

### Development

- **Add Features** - Extend admin dashboard functionality
- **Customize Design** - Modify Tailwind CSS classes
- **API Extensions** - Add new endpoints as needed
- **Database Optimization** - Add indexes for performance

## 🎯 Professional Quality Features

### Code Quality

- **Clean Architecture** - Separation of concerns
- **Error Handling** - Comprehensive error management
- **Input Validation** - Both client and server-side
- **Security Best Practices** - Industry-standard security
- **Documentation** - Comprehensive guides and comments

### User Experience

- **Intuitive Interface** - Easy-to-use admin dashboard
- **Fast Performance** - Optimized loading and interactions
- **Mobile-first Design** - Excellent mobile experience
- **Accessibility** - WCAG compliance
- **Professional Aesthetics** - Modern, clean design

### Business Ready

- **Scalable Architecture** - Ready for growth
- **Production Deployment** - Cloud-ready configuration
- **SEO Optimization** - Search engine friendly
- **Analytics Integration** - Track website performance
- **Content Management** - Easy updates without coding

## 📞 Support

### Getting Help

1. **Check the logs** - Browser console and server terminal
2. **Verify services** - Ensure both frontend and backend are running
3. **Test API endpoints** - Use curl or Postman
4. **Review documentation** - Check this README and PROJECT_GUIDE.md

### Common Solutions

- **Port conflicts**: Change ports in config files
- **Database issues**: Check MongoDB connection
- **Login problems**: Verify admin credentials
- **Image upload**: Check file size and type restrictions

## 🎉 Success Criteria

Your restaurant website is working perfectly when:

- ✅ Homepage loads with beautiful design and gallery
- ✅ Menu page shows interactive category filtering
- ✅ Admin login accepts credentials and redirects
- ✅ Admin dashboard loads with charts and functionality
- ✅ Gallery management allows image upload and editing
- ✅ Menu management supports full CRUD operations
- ✅ Website is fully responsive on all devices
- ✅ All API endpoints return proper responses
- ✅ Real-time updates work between admin and frontend

---

## 🏆 Professional Full-Stack Implementation

This project demonstrates professional full-stack development with:

- **Modern Frontend**: Tailwind CSS, responsive design, interactive components
- **Robust Backend**: Node.js/Express API with MongoDB integration
- **Security**: JWT authentication, input validation, file upload protection
- **User Experience**: Intuitive admin interface, smooth interactions
- **Production Ready**: Deployment configuration, error handling, documentation

**The Culinary Canvas** - Where technology meets culinary artistry! 🎨👨‍🍳

_Built with passion for exceptional digital dining experiences._

