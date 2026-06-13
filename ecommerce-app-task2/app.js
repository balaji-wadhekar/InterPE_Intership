// 1. Mock Database (52 Items)
const categories = ["Audio", "Peripherals", "Wearables", "Smart Tech"];
const imageTemplates = [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1615663245857-ac9310d5b1ff?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=400&q=80"
];

function generateProducts() {
    let prods = [];
    for(let i=1; i<=52; i++) {
        let cat = categories[i % categories.length];
        let price = (Math.random() * 300 + 20).toFixed(2);
        // Random stock: Mostly high, some very low for the UI badge feature
        let stock = Math.random() > 0.85 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 20) + 5; 
        prods.push({
            id: i,
            name: `Premium ${cat} Model X${i}`,
            price: parseFloat(price),
            category: cat,
            imgUrl: imageTemplates[i % imageTemplates.length],
            rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 to 5.0
            stockCount: stock
        });
    }
    return prods;
}

const products = generateProducts();

// 2. State Management
let cart = JSON.parse(localStorage.getItem('flipkart_vibe_cart_v3')) || [];
let wishlist = JSON.parse(localStorage.getItem('flipkart_vibe_wishlist_v3')) || [];
let currentCategory = "All";
let searchQuery = "";
let discountApplied = false;

// Pagination State
let visibleProductsCount = 12;
const INCREMENT_STEP = 12;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartItemsContainer = document.getElementById('cart-items');
const wishlistItemsContainer = document.getElementById('wishlist-items');
const totalPriceEl = document.getElementById('total-price');
const cartBadge = document.getElementById('cart-badge');
const wishlistBadge = document.getElementById('wishlist-badge');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');

const categoryItems = document.querySelectorAll('.category-item');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('checkbox-theme');

// Panels & Modals
const cartPanel = document.getElementById('cart-panel');
const wishlistPanel = document.getElementById('wishlist-panel');
const overlay = document.getElementById('panel-overlay');
const storeView = document.getElementById('store-view');
const checkoutView = document.getElementById('checkout-view');
const successModal = document.getElementById('success-modal');

// Init Theme
const savedTheme = localStorage.getItem('flipkart_vibe_theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'light';

themeToggle.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('flipkart_vibe_theme', newTheme);
});

// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : '✅');
    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => { toast.classList.add('show'); }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300); // Wait for transition
    }, 3000);
}

// 3. Render Engine
function renderProducts() {
    productGrid.innerHTML = ''; 
    const filteredProducts = products.filter(p => {
        const matchCategory = currentCategory === "All" || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Pagination Slice
    const productsToShow = filteredProducts.slice(0, visibleProductsCount);

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const isLiked = wishlist.includes(product.id);
        const heartChar = isLiked ? '❤️' : '🤍';
        const likedClass = isLiked ? 'liked' : '';
        
        // Stock logic
        const cartItem = cart.find(c => c.id === product.id);
        const cartQty = cartItem ? cartItem.quantity : 0;
        const availableStock = product.stockCount - cartQty;
        
        let stockBadge = '';
        if(availableStock > 0 && availableStock < 3) {
            stockBadge = `<span class="low-stock-badge">Only ${availableStock} Left!</span>`;
        }
        
        const btnState = availableStock <= 0 ? 'disabled' : '';
        const btnText = availableStock <= 0 ? 'Out of Stock' : 'Add to Cart';

        // Hover-to-zoom inline JS bindings for performance
        card.innerHTML = `
            ${stockBadge}
            <button class="card-wishlist-btn ${likedClass}" onclick="toggleWishlist(${product.id}, event)">${heartChar}</button>
            <div class="image-container" onmousemove="zoomImage(event, this)" onmouseleave="resetZoom(this)">
                <img src="${product.imgUrl}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="cat-rating-row">
                    <span class="product-category">${product.category}</span>
                    <span class="rating-badge">${product.rating} ★</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn-add" ${btnState} onclick="addToCart(${product.id}, '${product.name}')">${btnText}</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });

    // Toggle Load More Button
    if(visibleProductsCount >= filteredProducts.length) {
        loadMoreContainer.classList.add('hidden');
    } else {
        loadMoreContainer.classList.remove('hidden');
    }
}

// Hover-to-Zoom Logic
window.zoomImage = function(e, container) {
    const img = container.querySelector('img');
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    img.style.transform = 'scale(1.8)';
}

window.resetZoom = function(container) {
    const img = container.querySelector('img');
    img.style.transformOrigin = 'center center';
    img.style.transform = 'scale(1)';
}

function renderWishlistPanel() {
    wishlistItemsContainer.innerHTML = '';
    if(wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = '<p class="empty-panel">Your wishlist is empty.</p>';
        return;
    }
    
    wishlist.forEach(id => {
        const product = products.find(p => p.id === id);
        if(!product) return;
        
        const cartItem = cart.find(c => c.id === product.id);
        const cartQty = cartItem ? cartItem.quantity : 0;
        const availableStock = product.stockCount - cartQty;
        const btnState = availableStock <= 0 ? 'disabled' : '';

        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${product.name}</span>
                <span class="cart-item-price">$${product.price.toFixed(2)}</span>
            </div>
            <button class="btn-add" style="padding: 6px; font-size: 0.8rem;" ${btnState} onclick="addToCart(${product.id}, '${product.name}')">Add</button>
            <button class="close-panel" style="font-size: 1.2rem; margin-left: 5px;" onclick="toggleWishlist(${product.id})">&times;</button>
        `;
        wishlistItemsContainer.appendChild(item);
    });
}

// 4. State Handlers
function toggleWishlist(productId, event) {
    if(event) event.stopPropagation();
    
    const product = products.find(p => p.id === productId);
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showToast(`Removed ${product.name} from Wishlist`, 'warning');
    } else {
        wishlist.push(productId);
        showToast(`Added ${product.name} to Wishlist`, 'success');
    }
    
    localStorage.setItem('flipkart_vibe_wishlist_v3', JSON.stringify(wishlist));
    wishlistBadge.textContent = wishlist.length;
    renderProducts();
    renderWishlistPanel();
}

function addToCart(productId, productName) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    const cartQty = existingItem ? existingItem.quantity : 0;
    if(cartQty >= product.stockCount) {
        showToast('Maximum stock reached!', 'error');
        return; 
    }

    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    showToast(`Added ${productName} to Cart`, 'success');
    
    saveAndRenderCart();
    renderProducts(); 
    renderWishlistPanel(); 
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const product = products.find(p => p.id === productId);
        const newQty = cart[itemIndex].quantity + change;
        
        if (newQty > product.stockCount) {
            showToast('Stock limit reached!', 'error');
            return;
        }
        
        cart[itemIndex].quantity = newQty;
        if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
    }
    saveAndRenderCart();
    renderProducts();
    renderWishlistPanel();
}

function saveAndRenderCart() {
    localStorage.setItem('flipkart_vibe_cart_v3', JSON.stringify(cart));
    cartItemsContainer.innerHTML = '';
    
    let total = 0; let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-panel">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalItems += item.quantity;

            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });
    }

    totalPriceEl.textContent = `$${total.toFixed(2)}`;
    cartBadge.textContent = totalItems;
    updateCheckoutTotals();
}

// 5. Panel Interactions
document.getElementById('cart-btn').addEventListener('click', () => { cartPanel.classList.add('open'); overlay.classList.add('visible'); });
document.getElementById('wishlist-btn').addEventListener('click', () => { wishlistPanel.classList.add('open'); overlay.classList.add('visible'); });

function closePanels() {
    cartPanel.classList.remove('open');
    wishlistPanel.classList.remove('open');
    overlay.classList.remove('visible');
}
document.getElementById('close-cart').addEventListener('click', closePanels);
document.getElementById('close-wishlist').addEventListener('click', closePanels);
overlay.addEventListener('click', closePanels);

// Load More Listener
loadMoreBtn.addEventListener('click', () => {
    visibleProductsCount += INCREMENT_STEP;
    renderProducts();
});

// Navigation & Search
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        visibleProductsCount = INCREMENT_STEP; // Reset pagination on filter
        renderProducts();
        resetView();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    visibleProductsCount = INCREMENT_STEP; // Reset pagination on search
    renderProducts();
    resetView();
});

document.getElementById('home-link').addEventListener('click', resetView);
document.getElementById('shop-link').addEventListener('click', resetView);

function resetView(e) {
    if(e) e.preventDefault();
    checkoutView.classList.add('hidden');
    storeView.classList.remove('hidden');
    successModal.classList.add('hidden');
}

// 6. Checkout Workflow
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) { 
        showToast("Your cart is empty! Pick up some sweet gear first.", "warning"); 
        return; 
    }
    closePanels();
    storeView.classList.add('hidden');
    checkoutView.classList.remove('hidden');
    discountApplied = false;
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-message').textContent = '';
    document.getElementById('discount-row').classList.add('hidden');
    updateCheckoutTotals();
});

function updateCheckoutTotals() {
    let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    let discount = discountApplied ? total * 0.10 : 0;
    let finalAmount = total - discount;

    document.getElementById('checkout-item-count').textContent = itemsCount;
    document.getElementById('checkout-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${finalAmount.toFixed(2)}`;
}

// Promo Code
document.getElementById('apply-promo-btn').addEventListener('click', () => {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-message');
    if(code === 'WELCOME10') {
        discountApplied = true;
        msg.textContent = '10% Discount Applied Successfully!';
        msg.className = 'promo-message promo-success';
        document.getElementById('discount-row').classList.remove('hidden');
        showToast("Promo Code Applied!", "success");
        updateCheckoutTotals();
    } else {
        discountApplied = false;
        msg.textContent = 'Invalid Promo Code';
        msg.className = 'promo-message promo-error';
        document.getElementById('discount-row').classList.add('hidden');
        updateCheckoutTotals();
    }
});

// PIN Code Estimator
document.getElementById('pin-input').addEventListener('input', (e) => {
    const val = e.target.value;
    const est = document.getElementById('delivery-estimate');
    if(val.length === 6 && /^\d+$/.test(val)) {
        let date = new Date();
        date.setDate(date.getDate() + 3);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        est.textContent = `Delivery by ${dateStr}`;
        est.classList.remove('hidden');
    } else {
        est.classList.add('hidden');
    }
});

// Confirm Order
document.getElementById('confirm-order-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.getElementById('address-form');
    if(!form.checkValidity()) { form.reportValidity(); return; }

    const randomID = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('track-id').textContent = `#ORD-2026-${randomID}`;

    successModal.classList.remove('hidden');
    cart = []; saveAndRenderCart(); renderProducts(); renderWishlistPanel();
});

document.getElementById('continue-shopping-btn').addEventListener('click', resetView);

// Initialization
wishlistBadge.textContent = wishlist.length;
renderProducts();
saveAndRenderCart();
renderWishlistPanel();
