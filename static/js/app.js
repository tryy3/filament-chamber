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
  const mobileToggleButton = document.getElementById("sidebar-mobile-toggle");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const sidebarNavLinks = document.querySelectorAll("#sidebar nav a");

  let isExpanded = false;
  let isMobileOpen = false;

  const mqDesktop = window.matchMedia("(min-width: 768px)");

  function isDesktop() {
    return mqDesktop.matches;
  }

  // Toggle sidebar on button click
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      // Desktop-only: pin expanded/collapsed
      if (!isDesktop()) return;
      isExpanded = !isExpanded;
      toggleSidebar();
    });
  }

  // Mobile open/close (hamburger in the top bar)
  if (mobileToggleButton) {
    mobileToggleButton.addEventListener("click", function () {
      if (isMobileOpen) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  // Close when tapping backdrop (mobile)
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", function () {
      closeMobileSidebar();
    });
  }

  // Close on escape (mobile)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileSidebar();
    }
  });

  // Close on nav link click (mobile)
  sidebarNavLinks.forEach((a) => {
    a.addEventListener("click", function () {
      closeMobileSidebar();
    });
  });

  // Auto-expand on hover
  if (sidebar) {
    sidebar.addEventListener("mouseenter", function () {
      if (!isExpanded && isDesktop()) {
        expandSidebar();
      }
    });

    sidebar.addEventListener("mouseleave", function () {
      if (!isExpanded && isDesktop()) {
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
      // Only apply width changes on desktop; mobile uses fixed w-64 drawer.
      if (!isDesktop()) return;
      sidebar.classList.remove("md:w-16");
      sidebar.classList.add("md:w-64");
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
      // Only apply width changes on desktop; mobile uses fixed w-64 drawer.
      if (!isDesktop()) return;
      sidebar.classList.remove("md:w-64");
      sidebar.classList.add("md:w-16");
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

  function openMobileSidebar() {
    if (!sidebar) return;
    if (isDesktop()) return;

    isMobileOpen = true;
    sidebar.classList.remove("-translate-x-full");

    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove("hidden");
    }

    if (mobileToggleButton) {
      mobileToggleButton.setAttribute("aria-expanded", "true");
    }

    // Ensure labels are visible in drawer mode.
    if (sidebarTitle) {
      sidebarTitle.classList.remove("opacity-0");
      sidebarTitle.classList.add("opacity-100");
    }
    sidebarTexts.forEach((text) => {
      text.classList.remove("opacity-0");
      text.classList.add("opacity-100");
    });

    document.body.classList.add("overflow-hidden");
  }

  function closeMobileSidebar() {
    if (!sidebar) return;
    if (isDesktop()) return;
    if (!isMobileOpen) return;

    isMobileOpen = false;
    sidebar.classList.add("-translate-x-full");

    if (sidebarBackdrop) {
      sidebarBackdrop.classList.add("hidden");
    }

    if (mobileToggleButton) {
      mobileToggleButton.setAttribute("aria-expanded", "false");
    }

    document.body.classList.remove("overflow-hidden");
  }

  // Keep state sane when crossing the md breakpoint.
  mqDesktop.addEventListener("change", function () {
    if (isDesktop()) {
      // Ensure mobile drawer is closed when going to desktop.
      isMobileOpen = false;
      if (sidebar) {
        sidebar.classList.remove("-translate-x-full");
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add("hidden");
      }
      if (mobileToggleButton) {
        mobileToggleButton.setAttribute("aria-expanded", "false");
      }
      document.body.classList.remove("overflow-hidden");

      // Restore default desktop collapsed state.
      if (!isExpanded) collapseSidebar();
    } else {
      // On mobile, always start closed.
      if (sidebar) {
        sidebar.classList.add("-translate-x-full");
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add("hidden");
      }
      if (mobileToggleButton) {
        mobileToggleButton.setAttribute("aria-expanded", "false");
      }
      document.body.classList.remove("overflow-hidden");
      isMobileOpen = false;
    }
  });

  // Initialize correct translate state on load.
  if (!isDesktop() && sidebar) {
    sidebar.classList.add("-translate-x-full");
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
          optPayload: parsedSpool.opt, // Keep the OptPayload instance
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
          optMain: opts && opts.optMain,
          optAux: opts && opts.optAux,
        });
        const msg = window.fcTagModels.SpoolTag.buildNdefWriteMessage(built);
        logToConsoleAndDom("Writing spool tag...");
        await window.fcWebNfc.writeMessage(msg);
        logToConsoleAndDom("Wrote spool tag OK");
        return true;
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
        return true;
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        logToConsoleAndDom("Error writing location tag: " + message);
        return false;
      }
    },
  };
})();

// Filament-Chamber UI helpers (toast + modal) + spool detail actions
(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function ensureContainer(id) {
    return byId(id);
  }

  function showModal(message) {
    const modal = ensureContainer("fc-modal");
    if (!modal) return;
    const msg = byId("fc-modal-message");
    if (msg) msg.textContent = message || "Working…";
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function hideModal() {
    const modal = ensureContainer("fc-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function toast(opts) {
    const container = ensureContainer("fc-toasts");
    if (!container) return;

    const type = (opts && opts.type) || "info"; // info | success | error
    const message = (opts && opts.message) || "";
    const timeoutMs = (opts && opts.timeoutMs) || 4000;

    const el = document.createElement("div");
    const base =
      "rounded-lg shadow border px-4 py-3 text-sm flex items-start gap-2";
    let colors =
      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100";
    if (type === "success") {
      colors =
        "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100";
    } else if (type === "error") {
      colors =
        "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100";
    } else if (type === "info") {
      colors =
        "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100";
    }
    el.className = base + " " + colors;
    el.setAttribute("role", "status");
    el.textContent = message;

    container.appendChild(el);

    window.setTimeout(() => {
      el.classList.add("opacity-0");
      el.classList.add("transition-opacity");
      window.setTimeout(() => el.remove(), 250);
    }, timeoutMs);
  }

  window.fcUi = {
    showModal,
    hideModal,
    toast,
  };

  document.addEventListener("DOMContentLoaded", function () {
    function setButtonDisabled(btn, disabled) {
      if (!btn) return;
      btn.disabled = !!disabled;
      if (disabled) {
        btn.classList.add("opacity-60");
        btn.classList.add("cursor-not-allowed");
      } else {
        btn.classList.remove("opacity-60");
        btn.classList.remove("cursor-not-allowed");
      }
    }

    function nfcSupported() {
      return (
        window.fcNfc && window.fcNfc.isSupported && window.fcNfc.isSupported()
      );
    }

    function bindSpoolDetailWrite() {
      const btn = byId("fc-write-spool-tag");
      if (!btn) return;

      const spoolId = btn.getAttribute("data-spool-id");
      if (!spoolId) return;

      // If NFC not supported, disable and inform.
      if (!nfcSupported()) {
        setButtonDisabled(btn, true);
        toast({
          type: "error",
          message: "NFC is not supported in this browser/device.",
          timeoutMs: 6000,
        });
        return;
      }

      btn.addEventListener("click", async function () {
        setButtonDisabled(btn, true);
        showModal("Fetching spool details…");

        try {
          const rsp = await fetch("/api/spool/" + encodeURIComponent(spoolId), {
            headers: { Accept: "application/json" },
          });
          if (!rsp.ok) {
            throw new Error(
              "Failed to fetch spool details (HTTP " + rsp.status + ")"
            );
          }
          const spool = await rsp.json();

          const OPT = {
            MAIN: {
              MATERIAL_CLASS: 8,
              MATERIAL_TYPE: 9,
              MATERIAL_NAME: 10,
              BRAND_NAME: 11,
              NOMINAL_NETTO_FULL_WEIGHT: 16,
              ACTUAL_NETTO_FULL_WEIGHT: 17,
              EMPTY_CONTAINER_WEIGHT: 18,
              PRIMARY_COLOR: 19,
              DENSITY: 29,
              FILAMENT_DIAMETER: 30,
              MIN_PRINT_TEMPERATURE: 34,
              MAX_PRINT_TEMPERATURE: 35,
              MIN_BED_TEMPERATURE: 37,
              MAX_BED_TEMPERATURE: 38,
            },
            AUX: { CONSUMED_WEIGHT: 0 },
            ENUM: { MATERIAL_CLASS: { FFF: 0 } },
          };

          const truncate = (s, max) => {
            if (typeof s !== "string") return undefined;
            const t = s.trim();
            if (!t) return undefined;
            return t.length > max ? t.slice(0, max) : t;
          };

          const hexToRgbaBytes = (hex) => {
            if (typeof hex !== "string") return undefined;
            const cleaned = hex.trim().replace(/^#/, "");
            if (!cleaned) return undefined;
            if (!/^[0-9a-fA-F]+$/.test(cleaned)) return undefined;
            if (cleaned.length !== 6 && cleaned.length !== 8) return undefined;
            const bytes = new Uint8Array(cleaned.length === 8 ? 4 : 3);
            for (let i = 0; i < bytes.length; i++) {
              const byteHex = cleaned.slice(i * 2, i * 2 + 2);
              bytes[i] = parseInt(byteHex, 16);
            }
            return bytes;
          };

          const normalizeMaterial = (s) => {
            if (typeof s !== "string") return "";
            return s
              .trim()
              .toUpperCase()
              .replace(/[\s\-_]/g, "")
              .replace(/\+/g, "");
          };

          const mapMaterialTypeToOptEnum = (materialString) => {
            const m = normalizeMaterial(materialString);
            const map = {
              PLA: 0,
              PETG: 1,
              TPU: 2,
              ABS: 3,
              ASA: 4,
              PC: 5,
              PCTG: 6,
              PP: 7,
              PA6: 8,
              PA11: 9,
              PA12: 10,
              PA66: 11,
              CPE: 12,
              TPE: 13,
              HIPS: 14,
              PHA: 15,
              PET: 16,
              PEI: 17,
              PBT: 18,
              PVB: 19,
              PVA: 20,
              PEKK: 21,
              PEEK: 22,
              BVOH: 23,
              TPC: 24,
              PPS: 25,
              PPSU: 26,
              PVC: 27,
              PEBA: 28,
              PVDF: 29,
              PPA: 30,
              PCL: 31,
              PES: 32,
              PMMA: 33,
              POM: 34,
              PPE: 35,
              PS: 36,
              PSU: 37,
              TPI: 38,
              SBS: 39,
              OBC: 40,
            };
            if (m === "NYLON") return 10; // best-effort default to PA12
            if (m === "PA") return 10;
            return Object.prototype.hasOwnProperty.call(map, m)
              ? map[m]
              : undefined;
          };

          const pickPrimaryColorHex = (filament) => {
            if (!filament || typeof filament !== "object") return undefined;
            const multi = filament.multi_color_hexes;
            if (typeof multi === "string" && multi.trim()) {
              return multi.split(",")[0].trim();
            }
            const single = filament.color_hex;
            if (typeof single === "string" && single.trim())
              return single.trim();
            return undefined;
          };

          const optMain = {};
          const optAux = {};

          // Required-ish: material_class = FFF
          optMain[OPT.MAIN.MATERIAL_CLASS] = OPT.ENUM.MATERIAL_CLASS.FFF;

          // Strings (truncate to OPT limits)
          const brandName = truncate(spool?.filament?.vendor_name, 31);
          const materialName = truncate(spool?.filament?.name, 31);
          if (brandName) optMain[OPT.MAIN.BRAND_NAME] = brandName;
          if (materialName) optMain[OPT.MAIN.MATERIAL_NAME] = materialName;

          // Material type enum (best effort)
          const materialType = mapMaterialTypeToOptEnum(
            spool?.filament?.material
          );
          if (typeof materialType === "number")
            optMain[OPT.MAIN.MATERIAL_TYPE] = materialType;

          // Primary color bytes
          const colorHex = pickPrimaryColorHex(spool?.filament);
          const colorBytes = hexToRgbaBytes(colorHex);
          if (colorBytes) optMain[OPT.MAIN.PRIMARY_COLOR] = colorBytes;

          // Numbers
          const density = Number(spool?.filament?.density);
          if (Number.isFinite(density) && density > 0)
            optMain[OPT.MAIN.DENSITY] = density;

          const diameter = Number(spool?.filament?.diameter);
          if (Number.isFinite(diameter) && diameter > 0)
            optMain[OPT.MAIN.FILAMENT_DIAMETER] = diameter;

          const nominalWeight = Number(spool?.filament?.weight);
          if (Number.isFinite(nominalWeight) && nominalWeight > 0)
            optMain[OPT.MAIN.NOMINAL_NETTO_FULL_WEIGHT] = nominalWeight;

          const initialWeight = Number(spool?.initial_weight);
          if (Number.isFinite(initialWeight) && initialWeight > 0) {
            optMain[OPT.MAIN.ACTUAL_NETTO_FULL_WEIGHT] = initialWeight;
          } else if (Number.isFinite(nominalWeight) && nominalWeight > 0) {
            optMain[OPT.MAIN.ACTUAL_NETTO_FULL_WEIGHT] = nominalWeight;
          }

          const tareSpoolWeight = Number(spool?.spool_weight);
          const filamentSpoolWeight = Number(spool?.filament?.spool_weight);
          const emptyContainerWeight =
            Number.isFinite(tareSpoolWeight) && tareSpoolWeight > 0
              ? tareSpoolWeight
              : Number.isFinite(filamentSpoolWeight) && filamentSpoolWeight > 0
              ? filamentSpoolWeight
              : undefined;
          if (typeof emptyContainerWeight === "number")
            optMain[OPT.MAIN.EMPTY_CONTAINER_WEIGHT] = emptyContainerWeight;

          const extTemp = Number(spool?.filament?.settings_extruder_temp);
          if (Number.isFinite(extTemp) && extTemp > 0) {
            optMain[OPT.MAIN.MIN_PRINT_TEMPERATURE] = Math.round(extTemp);
            optMain[OPT.MAIN.MAX_PRINT_TEMPERATURE] = Math.round(extTemp);
          }

          const bedTemp = Number(spool?.filament?.settings_bed_temp);
          if (Number.isFinite(bedTemp) && bedTemp > 0) {
            optMain[OPT.MAIN.MIN_BED_TEMPERATURE] = Math.round(bedTemp);
            optMain[OPT.MAIN.MAX_BED_TEMPERATURE] = Math.round(bedTemp);
          }

          const usedWeight = Number(spool?.used_weight);
          if (Number.isFinite(usedWeight) && usedWeight > 0)
            optAux[OPT.AUX.CONSUMED_WEIGHT] = usedWeight;

          showModal("Approach NFC tag to write spool tag…");
          const ok = await window.fcNfc.writeSpoolTagInit(spoolId, {
            optMain,
            optAux,
          });
          hideModal();
          if (ok === false) {
            toast({ type: "error", message: "Failed to write spool tag." });
          } else {
            toast({
              type: "success",
              message: "Spool tag written successfully.",
            });
          }
        } catch (e) {
          hideModal();
          const msg = e && e.message ? String(e.message) : String(e);
          toast({ type: "error", message: "Error writing spool tag: " + msg });
        } finally {
          setButtonDisabled(btn, false);
        }
      });
    }

    function bindAdminNfcTools() {
      const spoolBtn = byId("fc-admin-write-spool-tag");
      const locBtn = byId("fc-admin-write-location-tag");
      const readBtn = byId("fc-admin-read-tag");
      const clearBtn = byId("fc-admin-clear-log");
      const scanTimeEl = byId("fc-scan-time");
      const scanSerialEl = byId("fc-scan-serial");
      const scanSpoolIdEl = byId("fc-scan-spool-id");
      const scanLocationEl = byId("fc-scan-location");
      const scanWarningsEl = byId("fc-scan-warnings");
      const scanJsonEl = byId("fc-scan-json");

      // No admin page elements present.
      if (!spoolBtn && !locBtn && !readBtn && !clearBtn) return;

      if (!nfcSupported()) {
        setButtonDisabled(spoolBtn, true);
        setButtonDisabled(locBtn, true);
        setButtonDisabled(readBtn, true);
        toast({
          type: "error",
          message: "NFC is not supported in this browser/device.",
          timeoutMs: 6000,
        });
      }

      if (spoolBtn) {
        spoolBtn.addEventListener("click", async function () {
          if (!nfcSupported()) return;
          const spoolIdInput = byId("fc-spool-id");
          const payloadInput = byId("fc-opt-payload-bytes");
          const auxInput = byId("fc-opt-aux-bytes");

          const spoolId = spoolIdInput ? Number(spoolIdInput.value) : NaN;
          const payloadSize = payloadInput ? Number(payloadInput.value) : NaN;
          const auxSize = auxInput ? Number(auxInput.value) : NaN;

          const opts = {
            payloadSize:
              Number.isFinite(payloadSize) && payloadSize > 0
                ? payloadSize
                : undefined,
            auxSize:
              Number.isFinite(auxSize) && auxSize > 0 ? auxSize : undefined,
          };

          setButtonDisabled(spoolBtn, true);
          showModal("Approach NFC tag to write spool tag…");
          try {
            const ok = await window.fcNfc.writeSpoolTagInit(spoolId, opts);
            hideModal();
            if (ok === false) {
              toast({ type: "error", message: "Failed to write spool tag." });
            } else {
              toast({
                type: "success",
                message: "Spool tag written successfully.",
              });
            }
          } catch (e) {
            hideModal();
            const msg = e && e.message ? String(e.message) : String(e);
            toast({
              type: "error",
              message: "Error writing spool tag: " + msg,
            });
          } finally {
            setButtonDisabled(spoolBtn, false);
          }
        });
      }

      if (locBtn) {
        locBtn.addEventListener("click", async function () {
          if (!nfcSupported()) return;
          const locInput = byId("fc-location");
          const location = locInput ? String(locInput.value) : "";

          setButtonDisabled(locBtn, true);
          showModal("Approach NFC tag to write location tag…");
          try {
            const ok = await window.fcNfc.writeLocationTagInit(location);
            hideModal();
            if (ok === false) {
              toast({
                type: "error",
                message: "Failed to write location tag.",
              });
            } else {
              toast({
                type: "success",
                message: "Location tag written successfully.",
              });
            }
          } catch (e) {
            hideModal();
            const msg = e && e.message ? String(e.message) : String(e);
            toast({
              type: "error",
              message: "Error writing location tag: " + msg,
            });
          } finally {
            setButtonDisabled(locBtn, false);
          }
        });
      }

      if (readBtn) {
        readBtn.addEventListener("click", async function () {
          if (!nfcSupported()) return;
          setButtonDisabled(readBtn, true);
          showModal("Approach NFC tag to read…");
          try {
            const out = await window.fcNfc.readTagOnce();
            hideModal();
            // Populate the "Last scan" panel (admin page)
            if (scanTimeEl) scanTimeEl.textContent = new Date().toISOString();
            if (scanSerialEl)
              scanSerialEl.textContent =
                out && out.serialNumber ? String(out.serialNumber) : "-";
            if (scanSpoolIdEl)
              scanSpoolIdEl.textContent =
                out && out.spool && out.spool.spool_id != null
                  ? String(out.spool.spool_id)
                  : "-";
            if (scanLocationEl)
              scanLocationEl.textContent =
                out && out.location && out.location.location != null
                  ? String(out.location.location)
                  : "-";
            if (scanWarningsEl) {
              const warnings = [];
              if (out && out.spool && Array.isArray(out.spool.warnings)) {
                warnings.push(...out.spool.warnings);
              }
              if (out && out.location && Array.isArray(out.location.warnings)) {
                warnings.push(...out.location.warnings);
              }
              scanWarningsEl.textContent = warnings.length
                ? warnings.join(", ")
                : "-";
            }
            if (scanJsonEl) {
              scanJsonEl.textContent = JSON.stringify(out, null, 2);
            }
            toast({
              type: "success",
              message: "Read tag successfully. See log/console for details.",
            });
          } catch (e) {
            hideModal();
            const msg = e && e.message ? String(e.message) : String(e);
            toast({ type: "error", message: "Error reading tag: " + msg });
          } finally {
            setButtonDisabled(readBtn, false);
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          const log = byId("fc-nfc-log");
          if (log) log.textContent = "";
          if (scanTimeEl) scanTimeEl.textContent = "-";
          if (scanSerialEl) scanSerialEl.textContent = "-";
          if (scanSpoolIdEl) scanSpoolIdEl.textContent = "-";
          if (scanLocationEl) scanLocationEl.textContent = "-";
          if (scanWarningsEl) scanWarningsEl.textContent = "-";
          if (scanJsonEl) scanJsonEl.textContent = "";
          toast({ type: "info", message: "Log cleared." });
        });
      }
    }

    function bindSpoolsScanNavigate() {
      const scanBtn = byId("fc-scan-spool-tag");
      if (!scanBtn) return;

      // State for the workflow
      let scannedSpoolData = null;

      // Modal management
      function showActionModal() {
        const modal = byId("fc-action-modal");
        if (modal) {
          modal.classList.remove("hidden");
          modal.setAttribute("aria-hidden", "false");
        }
      }

      function hideActionModal() {
        const modal = byId("fc-action-modal");
        if (modal) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      }

      function showLocationModal() {
        const modal = byId("fc-location-modal");
        if (modal) {
          modal.classList.remove("hidden");
          modal.setAttribute("aria-hidden", "false");
          showLocationStep("input");
        }
      }

      function hideLocationModal() {
        const modal = byId("fc-location-modal");
        if (modal) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      }

      function showLocationStep(step) {
        const inputStep = byId("fc-location-step-input");
        const processingStep = byId("fc-location-step-processing");

        if (inputStep) inputStep.classList.add("hidden");
        if (processingStep) processingStep.classList.add("hidden");

        if (step === "input" && inputStep) {
          inputStep.classList.remove("hidden");
        } else if (step === "processing" && processingStep) {
          processingStep.classList.remove("hidden");
        }
      }

      function populateActionModal(spoolData) {
        const spoolId = spoolData.spool_id || "-";
        const spoolName = spoolData.name || "Unknown Spool";
        const spoolMaterial = spoolData.material || "-";
        const spoolColor = spoolData.color || "#cccccc";

        const idEl = byId("fc-action-spool-id");
        const nameEl = byId("fc-action-spool-name");
        const materialEl = byId("fc-action-spool-material");
        const colorEl = byId("fc-action-spool-color");

        if (idEl) idEl.textContent = "ID: " + spoolId;
        if (nameEl) nameEl.textContent = spoolName;
        if (materialEl) materialEl.textContent = spoolMaterial;
        if (colorEl) colorEl.style.backgroundColor = spoolColor;
      }

      function populateLocationModal(spoolData) {
        const spoolName = spoolData.name || "Unknown Spool";
        const spoolNameEl = byId("fc-location-spool-name");
        if (spoolNameEl) spoolNameEl.textContent = spoolName;
      }

      // Main scan button handler
      scanBtn.addEventListener("click", async function () {
        if (!nfcSupported()) {
          toast({
            type: "error",
            message: "NFC is not supported in this browser/device.",
            timeoutMs: 6000,
          });
          return;
        }

        setButtonDisabled(scanBtn, true);
        showModal("Approach NFC tag to read…");

        try {
          const out = await window.fcNfc.readTagOnce();
          hideModal();

          const spoolId =
            out && out.spool ? Number(out.spool.spool_id) : Number.NaN;

          if (!Number.isFinite(spoolId) || spoolId <= 0) {
            toast({
              type: "error",
              message: "This tag is not a spool tag (no spool_id found).",
            });
            return;
          }

          // Store the scanned data for later use
          scannedSpoolData = {
            spool_id: spoolId,
            name: "Spool #" + spoolId,
            material: "-",
            color: "#cccccc",
            opt: out.spool.opt,
            optPayload: out.spool.optPayload, // Store the OptPayload instance
            rawData: out,
          };

          // Try to fetch spool details for better display
          try {
            const rsp = await fetch(
              "/api/spool/" + encodeURIComponent(spoolId),
              {
                headers: { Accept: "application/json" },
              }
            );
            if (rsp.ok) {
              const spool = await rsp.json();
              scannedSpoolData.name =
                (spool?.filament?.vendor_name || "") +
                " " +
                (spool?.filament?.name || "");
              scannedSpoolData.material = spool?.filament?.material || "-";
              scannedSpoolData.color =
                "#" + (spool?.filament?.color_hex || "cccccc");
              scannedSpoolData.spoolData = spool;
            }
          } catch (e) {
            // Ignore fetch errors, just use basic info
            console.warn("Could not fetch spool details:", e);
          }

          // Show action selection modal
          populateActionModal(scannedSpoolData);
          showActionModal();
        } catch (e) {
          hideModal();
          const msg = e && e.message ? String(e.message) : String(e);
          toast({ type: "error", message: "Error reading tag: " + msg });
        } finally {
          setButtonDisabled(scanBtn, false);
        }
      });

      // Action modal: View Details button
      const viewDetailsBtn = byId("fc-action-view-details");
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener("click", function () {
          if (scannedSpoolData && scannedSpoolData.spool_id) {
            window.location.href =
              "/spool/" + String(scannedSpoolData.spool_id);
          }
        });
      }

      // Action modal: Transfer Location button
      const transferLocationBtn = byId("fc-action-transfer-location");
      if (transferLocationBtn) {
        transferLocationBtn.addEventListener("click", function () {
          hideActionModal();
          if (scannedSpoolData) {
            populateLocationModal(scannedSpoolData);
            showLocationModal();
          }
        });
      }

      // Action modal: Cancel button
      const actionCancelBtn = byId("fc-action-cancel");
      if (actionCancelBtn) {
        actionCancelBtn.addEventListener("click", function () {
          hideActionModal();
          scannedSpoolData = null;
        });
      }

      // Action modal backdrop click
      const actionBackdrop = byId("fc-action-modal-backdrop");
      if (actionBackdrop) {
        actionBackdrop.addEventListener("click", function () {
          hideActionModal();
          scannedSpoolData = null;
        });
      }

      // Location modal: Scan Location Tag button
      const scanLocationBtn = byId("fc-location-scan-btn");
      if (scanLocationBtn) {
        scanLocationBtn.addEventListener("click", async function () {
          setButtonDisabled(scanLocationBtn, true);
          hideLocationModal();
          showModal("Approach location tag to scan…");

          try {
            const out = await window.fcNfc.readTagOnce();
            hideModal();

            const location = out && out.location ? out.location.location : null;

            if (!location) {
              toast({
                type: "error",
                message: "This tag is not a location tag.",
              });
              showLocationModal();
              return;
            }

            // Populate the location input with scanned value
            const locationInput = byId("fc-location-input");
            if (locationInput) {
              locationInput.value = location;
            }

            toast({
              type: "success",
              message: "Location tag scanned: " + location,
            });
            showLocationModal();
          } catch (e) {
            hideModal();
            const msg = e && e.message ? String(e.message) : String(e);
            toast({
              type: "error",
              message: "Error scanning location: " + msg,
            });
            showLocationModal();
          } finally {
            setButtonDisabled(scanLocationBtn, false);
          }
        });
      }

      // Location modal: Next button (send immediately)
      const locationNextBtn = byId("fc-location-next-btn");
      if (locationNextBtn) {
        locationNextBtn.addEventListener("click", async function () {
          const locationInput = byId("fc-location-input");
          const locationId = locationInput ? locationInput.value.trim() : "";

          if (!locationId) {
            toast({
              type: "error",
              message: "Please enter or scan a location ID.",
            });
            return;
          }

          if (!scannedSpoolData) {
            toast({
              type: "error",
              message: "Missing spool data.",
            });
            return;
          }

          // Show processing step
          showLocationStep("processing");
          setButtonDisabled(locationNextBtn, true);

          try {
            // Build payload with hybrid OPT data
            const timestamp = new Date().toISOString();
            const payload = {
              records: [
                {
                  value: {
                    spoolId: String(scannedSpoolData.spool_id),
                    locationId: locationId,
                    timestamp: timestamp,
                    tagData: {},
                  },
                },
              ],
            };

            // Translate OPT data if available

            if (scannedSpoolData.optPayload && window.fcOptTranslator) {
              try {
                const translated = window.fcOptTranslator.translateOptPayload(
                  scannedSpoolData.optPayload
                );
                if (translated) {
                  payload.records[0].value.tagData = translated;
                }
              } catch (e) {
                console.warn("Could not translate OPT data:", e);
                // Continue with empty tagData
              }
            }

            // Send to backend API endpoint (proxies to Kafka)
            const response = await fetch("/api/transfer-location", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                "Transfer request failed: " + (errorText || response.status)
              );
            }

            // Success!
            hideLocationModal();
            toast({
              type: "success",
              message: "Location transfer initiated successfully!",
            });

            // Reset state
            scannedSpoolData = null;
            if (locationInput) locationInput.value = "";

            // Optional: refresh the spool list to show updated location
            // Trigger htmx refresh if the spools-result element exists
            const spoolsResult = document.getElementById("spools-result");
            if (spoolsResult && window.htmx) {
              window.htmx.trigger(spoolsResult, "load");
            }
          } catch (e) {
            const msg = e && e.message ? String(e.message) : String(e);
            toast({
              type: "error",
              message: "Failed to initiate transfer: " + msg,
            });
            showLocationStep("input");
          } finally {
            setButtonDisabled(locationNextBtn, false);
          }
        });
      }

      // Location modal: Cancel button
      const locationCancelBtn = byId("fc-location-cancel-btn");
      if (locationCancelBtn) {
        locationCancelBtn.addEventListener("click", function () {
          hideLocationModal();
          scannedSpoolData = null;
          const locationInput = byId("fc-location-input");
          if (locationInput) locationInput.value = "";
        });
      }

      // Location modal backdrop click
      const locationBackdrop = byId("fc-location-modal-backdrop");
      if (locationBackdrop) {
        locationBackdrop.addEventListener("click", function () {
          hideLocationModal();
          scannedSpoolData = null;
          const locationInput = byId("fc-location-input");
          if (locationInput) locationInput.value = "";
        });
      }
    }

    bindSpoolDetailWrite();
    bindAdminNfcTools();
    bindSpoolsScanNavigate();
  });
})();
