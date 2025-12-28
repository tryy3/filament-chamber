// Custom JavaScript for Filament Chamber
console.log('Filament Chamber initialized');

// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Toggle dark class on html element
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            }
        });
    }
});

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

var nfc = {
  // (A) INIT
  hTxt : null, // html data to write
  hWrite : null, // html write button
  hRead : null, // html read button
  hMsg : null, // html "console messages"
  init : () => {
    // (A1) GET HTML ELEMENTS
    nfc.hTxt = document.getElementById("demoT"),
    nfc.hWrite = document.getElementById("demoW"),
    nfc.hRead = document.getElementById("demoR"),
    nfc.hMsg = document.getElementById("demoMSG");
 
    // (A2) FEATURE CHECK + GET PERMISSION
    if ("NDEFReader" in window) {
      nfc.logger("Ready");
      nfc.hWrite.disabled = false;
      nfc.hRead.disabled = false;
      nfc.hReadOnly.disabled = false;
    } else { nfc.logger("Web NFC is not supported on this browser."); }
  },
 
  // (B) HELPER - DISPLAY LOG MESSAGE
  logger : msg => {
    let row = document.createElement("div");
    row.innerHTML = msg;
    nfc.hMsg.appendChild(row);
  },
  // ...
};
window.onload = nfc.init;