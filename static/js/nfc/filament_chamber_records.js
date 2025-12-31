// Filament-Chamber custom NDEF record codecs (no bundler; classic script)
// Spec: server/docs/nfc/filament-chamber-records.md
(function () {
  "use strict";

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }

  function encodeJson(obj) {
    return new TextEncoder().encode(JSON.stringify(obj));
  }

  function decodeJson(bytes) {
    const txt = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return JSON.parse(txt);
  }

  function recordDataToBytes(record) {
    // Web NFC provides record.data as DataView
    if (record.data instanceof DataView) {
      return new Uint8Array(
        record.data.buffer,
        record.data.byteOffset,
        record.data.byteLength
      );
    }
    if (record.data instanceof ArrayBuffer) return new Uint8Array(record.data);
    if (record.data && record.data.constructor === Uint8Array)
      return record.data;
    throw new Error("Unsupported record.data type");
  }

  function parseSpoolmanLinkRecord(record) {
    const bytes = recordDataToBytes(record);
    const obj = decodeJson(bytes);

    assert(
      obj && typeof obj === "object",
      "spoolman record must be JSON object"
    );
    assert(
      obj.schema === window.fcNfcConst.FC_SCHEMA.SPOOLMAN,
      "spoolman schema mismatch"
    );
    assert(obj.version === 1, "unsupported spoolman record version");
    assert(
      Number.isInteger(obj.spool_id) && obj.spool_id > 0,
      "spool_id must be positive int"
    );

    return { spool_id: obj.spool_id };
  }

  function encodeSpoolmanLinkPayload(spool_id) {
    assert(
      Number.isInteger(spool_id) && spool_id > 0,
      "spool_id must be positive int"
    );
    return encodeJson({
      schema: window.fcNfcConst.FC_SCHEMA.SPOOLMAN,
      version: 1,
      spool_id,
    });
  }

  function parseLocationLinkRecord(record) {
    const bytes = recordDataToBytes(record);
    const obj = decodeJson(bytes);

    assert(
      obj && typeof obj === "object",
      "location record must be JSON object"
    );
    assert(
      obj.schema === window.fcNfcConst.FC_SCHEMA.LOCATION,
      "location schema mismatch"
    );
    assert(obj.version === 1, "unsupported location record version");
    assert(typeof obj.location === "string", "location must be string");
    const loc = obj.location.trim();
    assert(loc.length > 0, "location must be non-empty");
    // Recommended <= 64, but don't hard-fail unless you want to.

    return { location: loc };
  }

  function encodeLocationLinkPayload(location) {
    assert(typeof location === "string", "location must be string");
    const loc = location.trim();
    assert(loc.length > 0, "location must be non-empty");
    return encodeJson({
      schema: window.fcNfcConst.FC_SCHEMA.LOCATION,
      version: 1,
      location: loc,
    });
  }

  window.fcRecords = {
    recordDataToBytes,
    parseSpoolmanLinkRecord,
    encodeSpoolmanLinkPayload,
    parseLocationLinkRecord,
    encodeLocationLinkPayload,
  };
})();
