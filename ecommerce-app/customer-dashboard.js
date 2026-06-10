document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication (simulate for now)
    const currentUser = localStorage.getItem('ecommerce_currentUser');
    
    // For demo purposes, if not logged in, we'll pretend they are logged in as "Customer"
    const displayName = currentUser || "Customer";
    
    // Update UI with user info
    const emailDisplay = document.getElementById('userEmailDisplay');
    const avatarImage = document.getElementById('avatarImage');
    
    if (emailDisplay) {
        // Just extract the name part if it's an email
        const namePart = displayName.split('@')[0];
        // Capitalize first letter
        emailDisplay.textContent = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    
    if (avatarImage) {
        const initial = displayName.charAt(0).toUpperCase();
        avatarImage.src = `https://ui-avatars.com/api/?name=${initial}&background=06b6d4&color=fff`;
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

    // Smooth scrolling for navigation links
    document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Remove active class from all
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');

            const targetId = this.getAttribute('href').substring(1);
            if(targetId) {
                const targetElement = document.getElementById(targetId);
                if(targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
