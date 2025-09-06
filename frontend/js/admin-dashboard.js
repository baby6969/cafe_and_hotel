// Admin Dashboard JavaScript - Complete Interactive Implementation
'use strict';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let currentSection = 'dashboard';
let galleryImages = [];
let menuItems = [];
let currentGalleryImage = null;
let currentDishItem = null;

// Authentication check and initialization
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    if (adminUser) {
        try {
            const user = JSON.parse(adminUser);
            document.getElementById('admin-name').textContent = user.name || user.email || 'Admin User';
        } catch (e) {
            console.error('Error parsing user data');
        }
    }
    
    // Initialize the dashboard
    initializeDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    setupNavigation();
    setupCharts();
    loadDashboardData();
    loadGallery();
    loadMenuData();
    setupEventListeners();
    showToast('Welcome to the admin dashboard!', 'success');
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = {
        dashboard: document.getElementById('dashboardSection'),
        menu: document.getElementById('menuSection'),
        gallery: document.getElementById('gallerySection'),
        settings: document.getElementById('settingsSection')
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.dataset.section;
            switchToSection(section, link, sections);
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function switchToSection(sectionName, activeLink, sections) {
    // Update page title
    const titles = {
        dashboard: 'Dashboard Overview',
        menu: 'Menu Management',
        gallery: 'Gallery Management',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName];
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    activeLink.classList.add('active');
    
    // Show/hide sections
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[sectionName].classList.remove('hidden');
    
    currentSection = sectionName;
    
    // Load section-specific data
    if (sectionName === 'gallery') {
        loadGallery();
    } else if (sectionName === 'menu') {
        loadMenuData();
    }
}

// Setup all event listeners
function setupEventListeners() {
    setupGalleryListeners();
    setupMenuListeners();
    setupSettingsListeners();
}

// Gallery Management Functions
function setupGalleryListeners() {
    const uploadBtn = document.getElementById('uploadImageBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    
    uploadBtn.addEventListener('click', () => {
        uploadArea.classList.toggle('hidden');
    });
    
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-orange-400', 'bg-orange-50');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-orange-400', 'bg-orange-50');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-orange-400', 'bg-orange-50');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleImageUpload(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleImageUpload(files);
    });
}

function handleImageUpload(files) {
    if (files.length === 0) return;
    
    files.forEach(file => {
        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast('Please select only image files', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                url: e.target.result,
                title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
                description: '',
                active: true,
                uploadDate: new Date().toISOString(),
                size: file.size
            };
            
            galleryImages.push(imageData);
            renderGallery();
            updateGalleryStats();
            saveGalleryData();
            showToast('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    });
    
    uploadArea.classList.add('hidden');
    fileInput.value = '';
}

async function loadGallery() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/gallery`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            galleryImages = data.data.map(img => ({
                id: img.id,
                url: `http://localhost:5000${img.url}`,
                title: img.title,
                description: img.description,
                active: img.isActive,
                uploadDate: img.uploadedAt,
                size: img.size || 1000000
            }));
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('galleryImages');
            if (saved) {
                galleryImages = JSON.parse(saved);
            } else {
                galleryImages = getDefaultGalleryImages();
                saveGalleryData();
            }
        }
    } catch (error) {
        console.log('Gallery API not available, using local storage');
        // Fallback to localStorage
        const saved = localStorage.getItem('galleryImages');
        if (saved) {
            galleryImages = JSON.parse(saved);
        } else {
            galleryImages = getDefaultGalleryImages();
            saveGalleryData();
        }
    }
    
    renderGallery();
    updateGalleryStats();
}

function getDefaultGalleryImages() {
    return [
        {
            id: 'default_1',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6zFbwTtzi-487-fnUtNcHzCf6sw9L1VOpnE4lagqr10lo23S0HcyGY0W8oq_xxmdblBygMBKZjL4bdd0gI9wn1DJRrFcZb2nDkdqGlWI89Hpo3LWhGO9KDbs2UCHvWnGRMZEASjG7nrF7D8T1rELDDeYlK_OewiC3tFtKqzL01uk4jObXW3UiElOayhVxneM8XWVaoope7aOOJa1C5e0rOg1JLc1z-WQtOjzUCuMAHWoSHW2CQJZ13Oaef5RLDNIQLyCImcoq2LwD',
            title: 'Restaurant Interior',
            description: 'Beautiful dining area with elegant ambiance',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 1024000
        },
        {
            id: 'default_2',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8oO_9Z_S-ZB-ehd7BMzanOtURhs9grt244HuMjnuL_2pbNA6uyXzwakHdjtBr31KuZKvAyCf5RqraBqmIFayerBZWWtgF_Y3qVdN69xjGVARYkyAzyVdyRQhqot0yqbrjuI1240xPD9NJkOmTUUMFBsQvOVD55MqUvr4WDMhzz48oXr5q6rZOMAQmr2XFo1gc7kJRt3UKcclGBX1Ro2MVHUKZmWT-8-sHdN9b--BbckknfEMYb3smsv1iA9AtwwK99N5xSuYmritA',
            title: 'Signature Pasta',
            description: 'Our famous handmade pasta dish',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 1200000
        },
        {
            id: 'default_3',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDEANbhzCiXbeTqxJAJPW7H8aldx5-6u2Afd2Ygqn2hqCxLD13lg3nl6QI4PQTBT0doJThw8EtB7KOvj8sQj88qDzIl3DNRhCUuWiJuNlrp0Cu2m_AaW5YrNs2T4alaE7OF0N3dyLjWfw7l7FJhH2KnqSX-Kpdjjrzp5vkyIdmEf9SLjVRodR6CD8U7QVRn1tKKEwioZ-4ohmd5T4rQ3L0dW8eBOjrCdeBsTyKcruZlwCvPZ0jikDmeAidlH12IegtExJkt34JfeOY',
            title: 'Chef at Work',
            description: 'Our talented chef preparing fresh dishes',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 980000
        },
        {
            id: 'default_4',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAku0K2Z33r5DISBTR7HYmxUbh3mtOrrrU3sXqNIID-d5USXzze-jo1F5VL54kDMZb4hHC8YJG4XOtATqxXWwJPyghh4S1ai526o7a4PQeRtZUKtanLlh-jOMtGxQ2sggo8X7DYwPdP574UW2GSiAY7l_xOGH8g5IPBIV-p-LqFI65rGyXamwlCryb101hqrAMcglodFlolNeHIfZTe0Ooq1p3zqBLMXCxRdICX2Rk3laR7GXPVB-yMCUOMSDio5iy-uoIkNN1Kjm5I',
            title: 'Elegant Plating',
            description: 'Artistic food presentation',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 1100000
        },
        {
            id: 'default_5',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn7I7wIShlan4-Wfo13gQQdsNtnM_px1KLCWt2m5IvMs2J8Uat9baz6-o0njuiaijErHcewH2Ql-E4ZJlkuWYQib_kUUK7qTL5hKqh0G6bvyzLP0u6rWEHMV57fRQBCuUshvq4Wjaf1mOrEJ6tdgbfpfWKcyX8H8nXJUnb7dAwMolSORrOp9kXZ8NJK54UfbXijBI8zBVHLqrYJAD3J6IbCRhvS9RIh6-WRheyPCsuPlbhq_lhJjpwB3IL3fNLfUt_-m2I2MaMoFEI',
            title: 'Wine Selection',
            description: 'Premium wine collection',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 950000
        },
        {
            id: 'default_6',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZXED3hZyv5GHO3CJ6ysWCo6Vj7kWnMfCgyU75vHrnpweIzyuFv6BgxXfAP2z9kcbOYCMYku89QlD_NCQU8cUAol7APDLOio-fglm8fsSD9VqKSfFmUWRoxqvZ0esDoKr66B1_Fr7O3w7EqTodzSyo2zkK1cj084e8gOrF1I-snGhR2z6K-7A_r5yQMnRn62WrabJticww8xBYwqh5XNlo_q3CsvU065UXuI5k4X087u-MneTb1Cgd8DpS0j_ov13YmiVZXzCYOo1g',
            title: 'Fresh Ingredients',
            description: 'Quality ingredients for our dishes',
            active: true,
            uploadDate: new Date().toISOString(),
            size: 1050000
        }
    ];
}

function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    
    if (galleryImages.length === 0) {
        galleryGrid.classList.add('hidden');
        emptyGallery.classList.remove('hidden');
        return;
    }
    
    galleryGrid.classList.remove('hidden');
    emptyGallery.classList.add('hidden');
    
    galleryGrid.innerHTML = galleryImages.map(image => `
        <div class="relative group cursor-pointer gallery-item-enter" data-image-id="${image.id}">
            <div class="aspect-square overflow-hidden rounded-lg">
                <img src="${image.url}" alt="${image.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button class="edit-gallery-image bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 shadow-lg transition-all" title="Edit Image">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button class="delete-gallery-image bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transition-all" title="Delete Image">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
            <div class="absolute top-2 right-2">
                <span class="text-xs px-2 py-1 rounded-full font-medium ${image.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}">
                    ${image.active ? 'Active' : 'Hidden'}
                </span>
            </div>
            <div class="mt-2">
                <p class="text-sm font-medium text-gray-900 truncate">${image.title}</p>
                <p class="text-xs text-gray-500 truncate">${image.description || 'No description'}</p>
                <p class="text-xs text-gray-400">${formatFileSize(image.size || 0)}</p>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to gallery items
    galleryGrid.querySelectorAll('[data-image-id]').forEach(item => {
        const imageId = item.dataset.imageId;
        const image = galleryImages.find(img => img.id === imageId);
        
        item.querySelector('.edit-gallery-image').addEventListener('click', (e) => {
            e.stopPropagation();
            openGalleryModal(image);
        });
        
        item.querySelector('.delete-gallery-image').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this image?')) {
                deleteGalleryImage(imageId);
            }
        });
        
        item.addEventListener('click', () => {
            openGalleryModal(image);
        });
    });
}

function openGalleryModal(image) {
    currentGalleryImage = image;
    
    // Create modal HTML
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="galleryModalOverlay">
            <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto modal-enter">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">Image Details</h3>
                    <button id="closeGalleryModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="text-center">
                        <img src="${image.url}" class="w-full h-64 object-cover rounded-lg border">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Image Title</label>
                            <input type="text" id="galleryImageTitle" value="${image.title}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        </div>
                        <div class="flex items-center pt-8">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="galleryImageActive" ${image.active ? 'checked' : ''} class="rounded focus:ring-orange-500">
                                <span class="text-sm text-gray-700">Display on website</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="galleryImageDesc" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none">${image.description || ''}</textarea>
                    </div>
                </div>
                
                <div class="flex justify-between mt-8 pt-6 border-t">
                    <button id="deleteGalleryImage" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined">delete</span>
                        Delete Image
                    </button>
                    <div class="flex gap-3">
                        <button id="cancelGalleryChanges" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button id="saveGalleryChanges" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('galleryModalOverlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal event listeners
    document.getElementById('closeGalleryModal').addEventListener('click', closeGalleryModal);
    document.getElementById('cancelGalleryChanges').addEventListener('click', closeGalleryModal);
    document.getElementById('saveGalleryChanges').addEventListener('click', saveGalleryImageChanges);
    document.getElementById('deleteGalleryImage').addEventListener('click', deleteCurrentGalleryImage);
    
    // Close on outside click
    document.getElementById('galleryModalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'galleryModalOverlay') {
            closeGalleryModal();
        }
    });
}

function closeGalleryModal() {
    const modal = document.getElementById('galleryModalOverlay');
    if (modal) {
        modal.remove();
    }
    currentGalleryImage = null;
}

function saveGalleryImageChanges() {
    if (!currentGalleryImage) return;
    
    currentGalleryImage.title = document.getElementById('galleryImageTitle').value;
    currentGalleryImage.description = document.getElementById('galleryImageDesc').value;
    currentGalleryImage.active = document.getElementById('galleryImageActive').checked;
    
    renderGallery();
    updateGalleryStats();
    saveGalleryData();
    closeGalleryModal();
    showToast('Image updated successfully!', 'success');
}

function deleteCurrentGalleryImage() {
    if (!currentGalleryImage) return;
    
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
        deleteGalleryImage(currentGalleryImage.id);
        closeGalleryModal();
    }
}

function deleteGalleryImage(imageId) {
    galleryImages = galleryImages.filter(img => img.id !== imageId);
    renderGallery();
    updateGalleryStats();
    saveGalleryData();
    showToast('Image deleted successfully', 'success');
}

function updateGalleryStats() {
    const totalImages = galleryImages.length;
    const activeImages = galleryImages.filter(img => img.active).length;
    const totalSize = galleryImages.reduce((sum, img) => sum + (img.size || 0), 0);
    
    document.getElementById('total-images').textContent = totalImages;
    document.getElementById('active-images').textContent = activeImages;
    document.getElementById('gallery-count').textContent = activeImages;
    document.getElementById('storage-used').textContent = formatFileSize(totalSize);
}

function saveGalleryData() {
    localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
    updateWebsiteGallery();
}

function updateWebsiteGallery() {
    const activeImages = galleryImages.filter(img => img.active);
    localStorage.setItem('websiteGallery', JSON.stringify(activeImages));
}

// Menu Management Functions
function setupMenuListeners() {
    const addDishBtn = document.getElementById('addDishBtn');
    
    addDishBtn.addEventListener('click', () => openDishModal());
    
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', filterMenuItems);
    document.getElementById('categoryFilter').addEventListener('change', filterMenuItems);
    document.getElementById('availabilityFilter').addEventListener('change', filterMenuItems);
}

async function loadMenuData() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        
        if (response.ok) {
            const data = await response.json();
            menuItems = data.data.map(item => ({
                id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image: item.image ? `http://localhost:5000${item.image}` : null,
                available: item.isAvailable,
                featured: item.featured
            }));
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('menuItems');
            if (saved) {
                menuItems = JSON.parse(saved);
            } else {
                menuItems = getDefaultMenuItems();
                saveMenuData();
            }
        }
    } catch (error) {
        console.log('Menu API not available, using local storage');
        // Fallback to localStorage
        const saved = localStorage.getItem('menuItems');
        if (saved) {
            menuItems = JSON.parse(saved);
        } else {
            menuItems = getDefaultMenuItems();
            saveMenuData();
        }
    }
    
    renderMenuTable();
    updateMenuStats();
}

function getDefaultMenuItems() {
    return [
        {
            id: 'dish_1',
            name: 'Crispy Calamari',
            description: 'Tender calamari, lightly battered and fried to perfection, served with a zesty marinara sauce.',
            price: 12.00,
            category: 'Appetizers',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtqSGw92M9BJCfdl8EPrsj5y5fw--Ufh6xhjU9L7nY1kMiE4I64_FcdhO09znSLMv7zd-JALtDnYZPhPHQoEUI0ps1rOIuFT2el5xaRn_8CitFtLS6o-i9QXQKyzAdLexnrF0h_GEY052l2f0gqIfcHwLRfOSYm3wpS2pctFmN7ftHCyD2gUdEgXWyonGoqcmaBUUJeIuyqQIIDWUEKhgcdGGoLyuEchHPTdmhla4q60EdCcmKjBqIlRbZ82Wbt0FmlLy7NvdS4f8m',
            available: true,
            featured: false
        },
        {
            id: 'dish_2',
            name: 'Grilled Salmon',
            description: 'Fresh Atlantic salmon, grilled to perfection and served with roasted asparagus and lemon-dill sauce.',
            price: 24.00,
            category: 'Main Courses',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFC8DymIHQhtmUugrSXA0fjEPWdBk7f7IVbtASEuWkZOEn_n9qAFdrY7CQ28fgbYbIg6EEjL9PTCwc9FNLgcBQxkU17-UYhS7BulI-Cc4-TehlFuyg7dHH9r9ReYnX8oUghC9e59kAfJvxwhYsFy2uEgg9_2z4B2pHy6fXOD15tOjVwMjOM-W5yt5f2VDmBH4Vwq3f0NYBnH8D2bt06_4CUdrzmFfnZop-KiCawcgPhsmDVLf3a_3R58Bujm5q3hhCORpIQ7npaMMk',
            available: true,
            featured: true
        },
        {
            id: 'dish_3',
            name: 'Chocolate Lava Cake',
            description: 'A warm, gooey chocolate cake with a molten chocolate center, served with vanilla bean ice cream.',
            price: 9.00,
            category: 'Desserts',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmB95kUttEZCvMXFYWbcaPO86e_e_voaxQIFNAW9miD5-Iv2HN5WRRgOEymBPYVYNHzLS1wCq3ijIAnOuiHEGw0jZnFSVqUVrKM1uP1T7QLD0ZOM3UyL72ix3eshz5JTOZyyy9Jg-KsQSOt84X_pXrhxTfE-1uk9KAthNGHAlX2XD0CpsADa0bVlmPKreSr8y_jiZ_9gHSBMFhu6InIheRxij7eOY11d8G1D6ExFm0EToRQFftvz5sf5h2yOKHlGQGeBT175R7bMqk',
            available: true,
            featured: false
        },
        {
            id: 'dish_4',
            name: 'House Red Wine',
            description: 'A full-bodied red wine with notes of cherry and oak.',
            price: 8.00,
            category: 'Drinks',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFxZWIzXKYQZvu8LKzh3d7beYNNycpjY5jnvppsPGJGXMHxRUgTmqSVtV34xw8FtQAHmEAC85MnGYJRVWgD9jhpD7AOluJzi2ypiuPlOUgnWChAlr_gYdi8wr0vonBhSnwN9CnzWporEhy3x_OyV16hdSheZr00kBIZ7GyIclbPiurkSKiv8UVxP4HbGDHLYhE0TMgyBFXkgkrxZRZ2G3RGCBjQhxEDv8LmhoKFUgL0H0CCMJVmWhDy-PM6N_a8b819XCJVscN3NhL',
            available: true,
            featured: false
        }
    ];
}

function renderMenuTable() {
    const tableBody = document.getElementById('menuTableBody');
    
    if (menuItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12">
                    <div class="flex flex-col items-center">
                        <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">restaurant_menu</span>
                        <p class="text-gray-500 mb-4">No menu items found</p>
                        <button onclick="openDishModal()" class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            Add Your First Dish
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = menuItems.map(item => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="p-4">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border">` :
                    '<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><span class="material-symbols-outlined text-gray-400">image</span></div>'
                }
            </td>
            <td class="p-4">
                <div>
                    <p class="font-semibold text-gray-900">${escapeHtml(item.name)}</p>
                    <p class="text-sm text-gray-500 mt-1">${escapeHtml(item.description || '')}</p>
                    ${item.featured ? '<span class="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⭐ Featured</span>' : ''}
                </div>
            </td>
            <td class="p-4">
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    ${escapeHtml(item.category)}
                </span>
            </td>
            <td class="p-4">
                <span class="font-semibold text-gray-900">$${item.price.toFixed(2)}</span>
            </td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" ${item.available ? 'checked' : ''} class="sr-only availability-toggle" data-dish-id="${item.id}">
                        <div class="w-11 h-6 ${item.available ? 'bg-green-500' : 'bg-gray-300'} rounded-full transition-colors">
                            <div class="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${item.available ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5"></div>
                        </div>
                    </label>
                    <span class="text-sm font-medium ${item.available ? 'text-green-600' : 'text-gray-500'}">
                        ${item.available ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </td>
            <td class="p-4">
                <div class="flex gap-2">
                    <button onclick="editDish('${item.id}')" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onclick="deleteDish('${item.id}', '${escapeHtml(item.name)}')" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Setup availability toggles
    document.querySelectorAll('.availability-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const dishId = e.target.dataset.dishId;
            const dish = menuItems.find(item => item.id === dishId);
            if (dish) {
                dish.available = e.target.checked;
                saveMenuData();
                renderMenuTable();
                showToast(`${dish.name} ${dish.available ? 'enabled' : 'disabled'}`, 'success');
            }
        });
    });
}

function openDishModal(dish = null) {
    currentDishItem = dish;
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="dishModalOverlay">
            <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto modal-enter">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">${dish ? 'Edit Dish' : 'Add New Dish'}</h3>
                    <button id="closeDishModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form id="dishForm" class="space-y-6">
                    <input type="hidden" id="dishId" value="${dish ? dish.id : ''}">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dish Name *</label>
                            <input type="text" id="dishName" value="${dish ? dish.name : ''}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                            <input type="number" id="dishPrice" value="${dish ? dish.price : ''}" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select id="dishCategory" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                <option value="">Select Category</option>
                                <option value="Appetizers" ${dish && dish.category === 'Appetizers' ? 'selected' : ''}>Appetizers</option>
                                <option value="Main Courses" ${dish && dish.category === 'Main Courses' ? 'selected' : ''}>Main Courses</option>
                                <option value="Desserts" ${dish && dish.category === 'Desserts' ? 'selected' : ''}>Desserts</option>
                                <option value="Drinks" ${dish && dish.category === 'Drinks' ? 'selected' : ''}>Drinks</option>
                            </select>
                        </div>
                        <div class="flex items-center gap-6 pt-8">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="dishAvailable" ${dish ? (dish.available ? 'checked' : '') : 'checked'} class="rounded focus:ring-orange-500">
                                <span class="text-sm text-gray-700">Available</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="dishFeatured" ${dish && dish.featured ? 'checked' : ''} class="rounded focus:ring-orange-500">
                                <span class="text-sm text-gray-700">Featured</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="dishDescription" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none">${dish ? dish.description || '' : ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer" id="dishImageUpload">
                            <input type="file" id="dishImage" accept="image/*" class="hidden">
                            <div id="dishImagePlaceholder" ${dish && dish.image ? 'class="hidden"' : ''}>
                                <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                                <p class="text-gray-600">Click to upload dish image</p>
                                <p class="text-sm text-gray-400">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <div id="dishImagePreview" ${dish && dish.image ? '' : 'class="hidden"'}>
                                <img id="dishPreviewImg" src="${dish && dish.image ? dish.image : ''}" class="max-w-full h-48 object-cover rounded-lg mx-auto">
                                <p class="mt-2 text-sm text-gray-600">Click to change image</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" id="cancelDish" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" id="saveDish" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined hidden" id="dishSaveSpinner">refresh</span>
                            <span id="dishSaveText">Save Dish</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('dishModalOverlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal event listeners
    document.getElementById('closeDishModal').addEventListener('click', closeDishModal);
    document.getElementById('cancelDish').addEventListener('click', closeDishModal);
    document.getElementById('dishForm').addEventListener('submit', saveDish);
    
    // Dish image upload
    const dishImageUpload = document.getElementById('dishImageUpload');
    const dishImage = document.getElementById('dishImage');
    
    dishImageUpload.addEventListener('click', () => dishImage.click());
    dishImage.addEventListener('change', handleDishImageUpload);
    
    // Close on outside click
    document.getElementById('dishModalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'dishModalOverlay') {
            closeDishModal();
        }
    });
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('dishName').focus();
    }, 100);
}

function closeDishModal() {
    const modal = document.getElementById('dishModalOverlay');
    if (modal) {
        modal.remove();
    }
    currentDishItem = null;
}

function editDish(dishId) {
    const dish = menuItems.find(item => item.id === dishId);
    if (dish) {
        openDishModal(dish);
    }
}

function deleteDish(dishId, dishName) {
    if (confirm(`Are you sure you want to delete "${dishName}"? This action cannot be undone.`)) {
        menuItems = menuItems.filter(item => item.id !== dishId);
        renderMenuTable();
        updateMenuStats();
        saveMenuData();
        showToast('Dish deleted successfully', 'success');
    }
}

function saveDish(e) {
    e.preventDefault();
    
    const dishData = {
        id: document.getElementById('dishId').value || 'dish_' + Date.now(),
        name: document.getElementById('dishName').value.trim(),
        description: document.getElementById('dishDescription').value.trim(),
        price: parseFloat(document.getElementById('dishPrice').value),
        category: document.getElementById('dishCategory').value,
        available: document.getElementById('dishAvailable').checked,
        featured: document.getElementById('dishFeatured').checked,
        image: currentDishItem?.image || null
    };
    
    // Validation
    if (!dishData.name) {
        showToast('Dish name is required', 'error');
        return;
    }
    
    if (!dishData.price || dishData.price <= 0) {
        showToast('Valid price is required', 'error');
        return;
    }
    
    if (!dishData.category) {
        showToast('Category is required', 'error');
        return;
    }
    
    // Handle image upload
    const imageFile = document.getElementById('dishImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            dishData.image = e.target.result;
            saveDishData(dishData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveDishData(dishData);
    }
}

function saveDishData(dishData) {
    const existingIndex = menuItems.findIndex(item => item.id === dishData.id);
    
    if (existingIndex >= 0) {
        menuItems[existingIndex] = dishData;
        showToast('Dish updated successfully!', 'success');
    } else {
        menuItems.push(dishData);
        showToast('Dish added successfully!', 'success');
    }
    
    renderMenuTable();
    updateMenuStats();
    saveMenuData();
    closeDishModal();
}

function handleDishImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('dishImagePlaceholder').classList.add('hidden');
            document.getElementById('dishImagePreview').classList.remove('hidden');
            document.getElementById('dishPreviewImg').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function filterMenuItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    const rows = document.querySelectorAll('#menuTableBody tr');
    
    rows.forEach(row => {
        if (row.cells.length < 6) return; // Skip empty state row
        
        const name = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent.trim();
        const isAvailable = row.querySelector('.availability-toggle')?.checked;
        
        const matchesSearch = !searchTerm || name.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesAvailability = !availabilityFilter || 
            (availabilityFilter === 'available' && isAvailable) ||
            (availabilityFilter === 'unavailable' && !isAvailable);
        
        row.style.display = matchesSearch && matchesCategory && matchesAvailability ? '' : 'none';
    });
}

function updateMenuStats() {
    const availableCount = menuItems.filter(item => item.available).length;
    document.getElementById('active-dishes').textContent = availableCount;
}

function saveMenuData() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

// Settings Management
function setupSettingsListeners() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const settings = {
                restaurantName: document.getElementById('restaurant-name').value,
                contactEmail: document.getElementById('contact-email').value
            };
            
            localStorage.setItem('restaurantSettings', JSON.stringify(settings));
            showToast('Settings saved successfully!', 'success');
        });
    }
}

// Dashboard data loading
function loadDashboardData() {
    updateMenuStats();
    updateGalleryStats();
    
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        const orders = document.getElementById('total-orders');
        const revenue = document.getElementById('total-revenue');
        
        if (Math.random() > 0.8) { // 20% chance to update
            const currentOrders = parseInt(orders.textContent.replace(',', ''));
            const currentRevenue = parseFloat(revenue.textContent.replace('$', '').replace(',', ''));
            
            orders.textContent = (currentOrders + Math.floor(Math.random() * 3)).toLocaleString();
            revenue.textContent = '$' + (currentRevenue + Math.random() * 100).toFixed(0);
        }
    }, 30000);
}

// Charts setup
function setupCharts() {
    // Analytics Chart
    const analyticsCtx = document.getElementById('analyticsChart').getContext('2d');
    new Chart(analyticsCtx, {
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { 
                    type: 'bar', 
                    label: 'Visits', 
                    data: [120, 150, 180, 100, 200, 170, 90], 
                    backgroundColor: '#f97316',
                    borderRadius: 4
                },
                { 
                    type: 'line', 
                    label: 'Orders', 
                    data: [50, 70, 60, 90, 100, 80, 40], 
                    borderColor: '#2563eb', 
                    borderWidth: 3, 
                    fill: false, 
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                } 
            }, 
            scales: { 
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Appetizers', 'Main Courses', 'Desserts', 'Drinks'],
            datasets: [{
                data: [25, 40, 20, 15],
                backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'],
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    const colors = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
    };
    
    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    };
    
    // Update toast content
    toastIcon.textContent = icons[type] || icons.info;
    toastIcon.className = `material-symbols-outlined ${iconColors[type]} mr-3`;
    toastMessage.textContent = message;
    
    // Update toast styling
    const toastContainer = toast.firstElementChild;
    toastContainer.className = `bg-white p-4 rounded-lg shadow-lg max-w-sm border-l-4 ${colors[type]}`;
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});
