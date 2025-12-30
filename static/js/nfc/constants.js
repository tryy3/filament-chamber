// Filament-Chamber NFC constants (no bundler; classic script)
(function () {
  "use strict";

  const MIME = {
    OPT: "application/vnd.openprinttag",
    FC_SPOOLMAN: "application/vnd.filament-chamber.spoolman+json",
    FC_LOCATION: "application/vnd.filament-chamber.location+json",
  };

  const FC_SCHEMA = {
    SPOOLMAN: "filament-chamber.spoolman",
    LOCATION: "filament-chamber.location",
  };

  // Defaults tuned for NTAG215-ish capacities.
  // You can override per-init call.
  const DEFAULTS = {
    OPT_PAYLOAD_BYTES: 360,
    AUX_REGION_BYTES: 128,
    SCAN_TIMEOUT_MS: 15_000,
  };

  window.fcNfcConst = {
    MIME,
    FC_SCHEMA,
    DEFAULTS,
  };
})();
