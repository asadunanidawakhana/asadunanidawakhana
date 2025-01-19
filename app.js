// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const productsGrid = document.getElementById('productsGrid');
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const orderModal = document.getElementById('orderModal');
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authTabs = document.querySelectorAll('.auth-tabs .tab-btn');
    const closeBtn = document.querySelector('.close-btn');

    console.log('Auth button:', document.getElementById('authBtn'));
    console.log('Auth modal:', authModal);

    // Authentication State
    let currentUser = null;

    // Sample users database
    let users = JSON.parse(localStorage.getItem('users')) || [
        {
            id: 1,
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            createdAt: new Date().toISOString()
        }
    ];

    // Save initial users if none exist
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Auth Modal Control
    document.getElementById('authBtn').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Auth button clicked');
        authModal.style.display = 'flex';
    });

    // Modal Control
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn');

    // Close modal with close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                // Reset form if exists
                const form = modal.querySelector('form');
                if (form) form.reset();
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            // Reset form if exists
            const form = e.target.querySelector('form');
            if (form) form.reset();
        }
    });

    // Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab button
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        
        try {
            const user = await authenticateUser(email, password);
            if (user) {
                currentUser = user;
                updateUIForLoggedInUser();
                authModal.style.display = 'none';
                showNotification('Welcome back, ' + user.name + '! ');
                resetForms();
            } else {
                showNotification('Invalid email or password ');
            }
        } catch (error) {
            showNotification('Login failed. Please try again.');
        }
    });

    // Signup Form Handler
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Signup form submitted');
        
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match ');
            return;
        }
        
        try {
            const user = await registerUser(name, email, password);
            currentUser = user;
            updateUIForLoggedInUser();
            authModal.style.display = 'none';
            showNotification('Welcome to ASAD UNANI DAWAKHANA! ');
            resetForms();
        } catch (error) {
            showNotification(error.message || 'Registration failed. Please try again.');
        }
    });

    // Authentication Functions
    async function registerUser(name, email, password) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (users.some(u => u.email === email)) {
            throw new Error('Email already registered ');
        }
        
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return { ...newUser, password: undefined };
    }

    async function authenticateUser(email, password) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const user = users.find(u => u.email === email && u.password === password);
        return user ? { ...user, password: undefined } : null;
    }

    function updateUIForLoggedInUser() {
        document.getElementById('authBtn').textContent = currentUser.name;
        document.getElementById('authBtn').classList.add('logged-in');
        
        document.querySelectorAll('.protected-feature').forEach(el => {
            el.classList.remove('disabled');
        });
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    function checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
        }
    }

    function resetForms() {
        loginForm.reset();
        signupForm.reset();
        // Reset tabs to login
        authTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="login"]').classList.add('active');
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        loginForm.classList.add('active');
    }

    // Notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    // Logout functionality
    document.getElementById('authBtn').addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (currentUser) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            document.getElementById('authBtn').textContent = 'Login';
            document.getElementById('authBtn').classList.remove('logged-in');
            showNotification('Logged out successfully ');
            
            document.querySelectorAll('.protected-feature').forEach(el => {
                el.classList.add('disabled');
            });
        }
    });

    // Password Reset Handler
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        const email = loginForm.querySelector('input[name="email"]').value;
        if (email) {
            showNotification('Password reset instructions sent to your email ');
        } else {
            showNotification('Please enter your email first ');
        }
    });

    // Load and display products
    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        if (productsGrid) {
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="price">₹${product.price}</p>
                    <button class="add-to-cart-btn gradient-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Cart 
                    </button>
                </div>
            `).join('');
        }
    }

    // Initialize cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }

    loadProducts();
    checkExistingSession();

    // Reload products when localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'products') {
            loadProducts();
        }
    });

    // Cart functionality
    function addToCart(product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartModal();
        showNotification('Added to cart! ');
    }

    function updateCartModal() {
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='placeholder.jpg'">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="price">₹${item.price}</p>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + item.price, 0);
            const cartTotal = document.getElementById('cartTotal');
            if (cartTotal) {
                cartTotal.textContent = `₹${total.toFixed(2)}`;
            }
        }
    }

    // Make addToCart function globally available
    window.addToCart = addToCart;

    // Modal handlers
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'flex';
            updateCartModal();
        });
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartModal();
        showNotification('Item removed from cart');
    }

    // Make removeFromCart function globally available
    window.removeFromCart = removeFromCart;

    // Checkout functionality
    function proceedToCheckout() {
        if (cart.length === 0) {
            showNotification('Your cart is empty! Add some products first.');
            return;
        }

        // Close cart modal and open order modal
        cartModal.style.display = 'none';
        orderModal.style.display = 'flex';

        // Update order summary
        const orderSummary = document.createElement('div');
        orderSummary.className = 'order-summary';
        orderSummary.innerHTML = `
            <div class="order-items">
                ${cart.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='placeholder.jpg'">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="price">₹${item.price}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total Amount:</strong>
                <span>₹${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
        `;

        // Insert order summary before the form
        const orderForm = document.getElementById('orderForm');
        orderForm.insertBefore(orderSummary, orderForm.firstChild);
    }

    // Make proceedToCheckout function globally available
    window.proceedToCheckout = proceedToCheckout;

    // Handle order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(e.target);
            const orderData = {
                customerName: formData.get('fullName'),
                phoneNumber: formData.get('phoneNumber'),
                address: formData.get('address'),
                age: formData.get('age'),
                gender: formData.get('gender'),
                items: cart,
                total: cart.reduce((sum, item) => sum + item.price, 0),
                orderDate: new Date().toISOString(),
                status: 'pending' // Add initial status
            };

            // Save order (in real app, send to server)
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();

            // Close modal and show success message
            orderModal.style.display = 'none';
            showNotification('Order placed successfully! Please check WhatsApp for order confirmation ');

            // Reset form and remove order summary
            orderForm.reset();
            const orderSummary = orderForm.querySelector('.order-summary');
            if (orderSummary) {
                orderSummary.remove();
            }

            // Reload order history if settings modal is open
            if (settingsModal.style.display === 'flex') {
                loadOrderHistory();
            }
        });
    }

    // Load user's order history
    function loadOrderHistory() {
        console.log('Loading order history...');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const ordersList = document.querySelector('.orders-list');
        
        console.log('Current user:', currentUser);
        console.log('All orders:', orders);
        
        if (!ordersList || !currentUser) {
            console.log('No orders list element or user not logged in');
            if (ordersList) {
                ordersList.innerHTML = '<p class="no-orders">Please log in to view your orders</p>';
            }
            return;
        }
        
        // Filter orders by current user's name
        const userOrders = orders.filter(order => order.customerName === currentUser.name);
        console.log('User orders:', userOrders);

        if (userOrders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
            return;
        }

        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                    <span class="status-${order.status || 'pending'}">${order.status || 'pending'}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='placeholder.jpg'">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p class="price">₹${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span>Total Amount:</span>
                    <span class="order-total">₹${order.total.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    // Add event listener for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'orders') {
            loadOrderHistory();
        }
    });

    // Settings panel functionality
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings button clicked');
            settingsModal.style.display = 'flex';
            // Load order history when settings modal is opened
            loadOrderHistory();
            // Switch to orders tab by default
            switchSettingsTab('orders');
        });
    }

    // Tab switching functionality
    function switchSettingsTab(tabName) {
        console.log('Switching to tab:', tabName);
        const tabs = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-pane');
        
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Content`).classList.add('active');
        
        if (tabName === 'orders') {
            loadOrderHistory();
        }
    }

    // Make functions globally available
    window.switchSettingsTab = switchSettingsTab;

    // Initialize settings
    document.addEventListener('DOMContentLoaded', () => {
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                switchSettingsTab('orders');
            });
        }
    });

    // Reload order history when localStorage changes
    window.addEventListener('storage', loadOrderHistory);
});
