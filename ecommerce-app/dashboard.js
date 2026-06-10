document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const currentUser = localStorage.getItem('ecommerce_currentUser');
    
    if (!currentUser) {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }

    // Update UI with user info
    const emailDisplay = document.getElementById('userEmailDisplay');
    const avatarImage = document.getElementById('avatarImage');
    
    if (emailDisplay && currentUser) {
        emailDisplay.textContent = currentUser;
    }
    
    if (avatarImage && currentUser) {
        // Generate an avatar based on the first letter of the email
        const initial = currentUser.charAt(0).toUpperCase();
        avatarImage.src = `https://ui-avatars.com/api/?name=${initial}&background=8b5cf6&color=fff`;
    }

    // Logout Functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('ecommerce_currentUser');
            window.location.href = 'index.html';
        });
    }
});
