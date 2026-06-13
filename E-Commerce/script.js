document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toast Notification System
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : 'ph-info';
        
        toast.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Add interactivity to buttons
    const cartBadge = document.querySelector('.cart-badge');
    let cartCount = 0;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        if (btn.classList.contains('add-to-cart') || (btn.classList.contains('btn-primary') && btn.textContent.includes('Shop Now'))) {
            // Add to cart animation
            cartCount++;
            cartBadge.textContent = cartCount;
            
            // Pulse animation on badge
            cartBadge.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartBadge.style.transform = 'scale(1)';
            }, 200);
            
            showToast('Item added to your shopping bag!', 'success');
        } 
        else if (btn.classList.contains('action-btn') && btn.innerHTML.includes('heart')) {
            const icon = btn.querySelector('i');
            if (icon.classList.contains('ph-heart')) {
                icon.classList.remove('ph-heart');
                icon.classList.add('ph-heart-fill');
                icon.style.color = 'var(--sale)';
                showToast('Added to your wishlist.', 'success');
            } else {
                icon.classList.remove('ph-heart-fill');
                icon.classList.add('ph-heart');
                icon.style.color = '';
                showToast('Removed from wishlist.', 'info');
            }
        }
        else if (btn.classList.contains('cart-btn')) {
            showToast(`Opening bag (${cartCount} items)`, 'info');
        }
        else {
            const text = btn.textContent.trim() || btn.getAttribute('aria-label') || 'Action';
            showToast(`${text} - Coming soon!`, 'info');
        }
    });
});
