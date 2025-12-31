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
    // IMPORTANT: Many Type 2 tag stacks behave poorly when the NDEF TLV length
    // needs to expand beyond 1 byte (>255 total message bytes).
    // A spool tag writes TWO MIME records; keep the OPT payload small so the
    // combined NDEF message stays under 255 bytes on common Android stacks.
    // Keep comfortably under the 255-byte boundary for Type 2 NDEF TLV length.
    OPT_PAYLOAD_BYTES: 80,
    // Start with no aux allocation by default to maximize compatibility.
    // You can re-init later with AUX if you decide to store consumed_weight on-tag.
    AUX_REGION_BYTES: 0,
    SCAN_TIMEOUT_MS: 15_000,
  };

  window.fcNfcConst = {
    MIME,
    FC_SCHEMA,
    DEFAULTS,
  };
})();
