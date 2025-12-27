// Custom JavaScript for Filament Chamber
console.log('Filament Chamber initialized');

// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarTitle = document.getElementById('sidebar-title');
    const sidebarTexts = document.querySelectorAll('.sidebar-text');
    const toggleButton = document.getElementById('sidebar-toggle');
    
    let isExpanded = false;
    
    // Toggle sidebar on button click
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            isExpanded = !isExpanded;
            toggleSidebar();
        });
    }
    
    // Auto-expand on hover
    if (sidebar) {
        sidebar.addEventListener('mouseenter', function() {
            if (!isExpanded) {
                expandSidebar();
            }
        });
        
        sidebar.addEventListener('mouseleave', function() {
            if (!isExpanded) {
                collapseSidebar();
            }
        });
    }
    
    function toggleSidebar() {
        if (isExpanded) {
            expandSidebar();
        } else {
            collapseSidebar();
        }
    }
    
    function expandSidebar() {
        if (sidebar) {
            sidebar.classList.remove('w-16');
            sidebar.classList.add('w-64');
        }
        if (sidebarTitle) {
            sidebarTitle.classList.remove('opacity-0');
            sidebarTitle.classList.add('opacity-100');
        }
        sidebarTexts.forEach(text => {
            text.classList.remove('opacity-0');
            text.classList.add('opacity-100');
        });
    }
    
    function collapseSidebar() {
        if (sidebar) {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-16');
        }
        if (sidebarTitle) {
            sidebarTitle.classList.remove('opacity-100');
            sidebarTitle.classList.add('opacity-0');
        }
        sidebarTexts.forEach(text => {
            text.classList.remove('opacity-100');
            text.classList.add('opacity-0');
        });
    }
});

