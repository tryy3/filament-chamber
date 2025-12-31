// Custom JavaScript for Filament Chamber
console.log("Filament Chamber initialized");

// Dark mode toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      // Toggle dark class on html element
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
      } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
      }
    });
  }
});

// Sidebar toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarTitle = document.getElementById("sidebar-title");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const toggleButton = document.getElementById("sidebar-toggle");

  let isExpanded = false;

  // Toggle sidebar on button click
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      isExpanded = !isExpanded;
      toggleSidebar();
    });
  }

  // Auto-expand on hover
  if (sidebar) {
    sidebar.addEventListener("mouseenter", function () {
      if (!isExpanded) {
        expandSidebar();
      }
    });

    sidebar.addEventListener("mouseleave", function () {
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
      sidebar.classList.remove("w-16");
      sidebar.classList.add("w-64");
    }
    if (sidebarTitle) {
      sidebarTitle.classList.remove("opacity-0");
      sidebarTitle.classList.add("opacity-100");
    }
    sidebarTexts.forEach((text) => {
      text.classList.remove("opacity-0");
      text.classList.add("opacity-100");
    });
  }

  function collapseSidebar() {
    if (sidebar) {
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-16");
    }
    if (sidebarTitle) {
      sidebarTitle.classList.remove("opacity-100");
      sidebarTitle.classList.add("opacity-0");
    }
    sidebarTexts.forEach((text) => {
      text.classList.remove("opacity-100");
      text.classList.add("opacity-0");
    });
  }
});

// Filament-Chamber NFC API (global, classic scripts)
(function () {
  function logToConsoleAndDom(msg) {
    console.log("[fcNfc]", msg);
    const el = document.getElementById("fc-nfc-log");
    if (!el) return;
    const row = document.createElement("div");
    row.textContent = String(msg);
    el.appendChild(row);
  }

  window.fcNfc = {
    isSupported: () => window.fcWebNfc && window.fcWebNfc.isSupported(),

    log: (msg) => logToConsoleAndDom(msg),

    readTagOnce: async () => {
      logToConsoleAndDom("Approach NFC tag to read...");
      const evt = await window.fcWebNfc.scanOnce({});
      const msg = evt.message;
      const parsedSpool = window.fcTagModels.SpoolTag.parse(msg);
      const parsedLoc = window.fcTagModels.LocationTag.parse(msg);
      const out = {
        serialNumber: evt.serialNumber,
        spool: {
          spool_id: parsedSpool.spool_id,
          warnings: parsedSpool.warnings,
          opt: parsedSpool.opt ? parsedSpool.opt.toObject() : null,
        },
        location: {
          location: parsedLoc.location,
          warnings: parsedLoc.warnings,
        },
      };
      logToConsoleAndDom("Read OK (see console for full object)");
      console.log("[fcNfc] read result:", out);
      return out;
    },

    writeSpoolTagInit: async (spool_id, opts) => {
      try {
        logToConsoleAndDom("Approach NFC tag to write spool tag...");
        const built = window.fcTagModels.SpoolTag.init({
          spool_id: Number(spool_id),
          payloadSize: opts && opts.payloadSize,
          auxSize: opts && opts.auxSize,
        });
        const msg = window.fcTagModels.SpoolTag.buildNdefWriteMessage(built);
        logToConsoleAndDom("Writing spool tag...");
        await window.fcWebNfc.writeMessage(msg);
        logToConsoleAndDom("Wrote spool tag OK");
      } catch (error) {
        const name = error && error.name ? String(error.name) : "Error";
        const message =
          error && error.message ? String(error.message) : String(error);
        logToConsoleAndDom(`Error writing spool tag: ${name}: ${message}`);
        return false;
      }
    },

    writeLocationTagInit: async (location) => {
      try {
        logToConsoleAndDom("Approach NFC tag to write location tag...");
        const built = window.fcTagModels.LocationTag.init({
          location: String(location),
        });
        const msg = window.fcTagModels.LocationTag.buildNdefWriteMessage(built);
        logToConsoleAndDom("Writing location tag...");
        await window.fcWebNfc.writeMessage(msg);
        logToConsoleAndDom("Wrote location tag OK");
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        logToConsoleAndDom("Error writing location tag: " + message);
        return false;
      }
    },
  };
})();
