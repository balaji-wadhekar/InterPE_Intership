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

document.addEventListener('DOMContentLoaded', () => {
    // Add global listener for unimplemented buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .social-btn, .view-all, .icon-btn, .add-to-cart-btn, .forgot-password, .signup-prompt a');
        if (!btn) return;
        
        // Skip if it's a structural button that already has an event
        if (btn.id === 'submitBtn' || btn.id === 'togglePassword' || btn.id === 'logoutBtn' || btn.type === 'submit') return;
        
        e.preventDefault();
        
        let actionName = 'Action';
        if (btn.classList.contains('social-btn')) {
            const platform = btn.querySelector('i').className.includes('google') ? 'Google' : 'Apple';
            actionName = `Login with ${platform}`;
            showToast(`${actionName} coming soon!`, 'info');
        } else if (btn.classList.contains('add-to-cart-btn')) {
            const productCard = btn.closest('.product-card');
            const productName = productCard ? productCard.querySelector('h3').textContent : 'Item';
            showToast(`Added ${productName} to Cart!`, 'success');
        } else if (btn.classList.contains('icon-btn')) {
            const isCart = btn.querySelector('.ph-shopping-cart');
            const isBell = btn.querySelector('.ph-bell');
            if (isCart) showToast('Opening Cart...', 'info');
            else if (isBell) showToast('No new notifications', 'info');
            else showToast('Feature coming soon!', 'info');
        } else if (btn.classList.contains('view-all')) {
            showToast(`Loading full list...`, 'info');
        } else {
            actionName = btn.textContent.trim() || 'Button clicked';
            showToast(`${actionName} - Feature in development`, 'info');
        }
    });

    // For document cards
    document.addEventListener('click', (e) => {
        const docCard = e.target.closest('.doc-card');
        if (docCard) {
            const title = docCard.querySelector('h4').textContent;
            showToast(`Downloading ${title}...`, 'success');
        }
    });
});
