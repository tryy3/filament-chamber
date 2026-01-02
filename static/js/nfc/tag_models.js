// SpoolTag / LocationTag models (no bundler; classic script)
(function () {
  "use strict";

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }

  function isUint8Array(x) {
    return x && x.constructor === Uint8Array;
  }

  function findMimeRecord(records, mediaType) {
    for (const r of records) {
      if (r.recordType === "mime" && r.mediaType === mediaType) return r;
    }
    return null;
  }

  class SpoolTag {
    static init(params) {
      const spool_id = params && params.spool_id;
      assert(
        Number.isInteger(spool_id) && spool_id > 0,
        "spool_id must be positive int"
      );

      // Important: if payloadSize is omitted, OptPayload.init() will use a compact
      // representation (no padding). That is much more reliable to write on some
      // Android/Web NFC stacks.
      let payloadSize = params ? params.payloadSize : undefined;
      const auxSize =
        params && typeof params.auxSize === "number"
          ? params.auxSize
          : window.fcNfcConst.DEFAULTS.AUX_REGION_BYTES;

      // If we intend to populate OPT keys (optMain/optAux), the compact layout
      // is too small because it allocates only enough space for empty CBOR maps.
      // Switch to a preallocated layout with a large (<=512B) main region.
      if (
        payloadSize === undefined &&
        params &&
        (params.optMain || params.optAux)
      ) {
        payloadSize = 100 + auxSize;
      }

      console.log("payloadSize", payloadSize);

      const opt = window.fcOpt.OptPayload.init({ payloadSize, auxSize });

      // Optionally populate OPT fields from caller-provided maps/objects.
      const applyKeyValues = (target, kv) => {
        if (!kv) return;
        if (kv instanceof Map) {
          for (const [k, v] of kv.entries()) target(Number(k), v);
          return;
        }
        if (typeof kv === "object" && !Array.isArray(kv)) {
          for (const k of Object.keys(kv)) target(Number(k), kv[k]);
          return;
        }
        throw new Error("Expected optMain/optAux to be Map or object");
      };

      applyKeyValues((k, v) => opt.setMainKey(k, v), params && params.optMain);
      if (opt.getAuxMap()) {
        applyKeyValues((k, v) => opt.setAuxKey(k, v), params && params.optAux);
      }
      const spoolJson = window.fcRecords.encodeSpoolmanLinkPayload(spool_id);

      return {
        optPayloadBytes: opt.toBytes(),
        spoolmanJsonBytes: spoolJson,
      };
    }

    static buildNdefWriteMessage(params) {
      assert(
        params && isUint8Array(params.optPayloadBytes),
        "optPayloadBytes must be Uint8Array"
      );
      assert(
        params && isUint8Array(params.spoolmanJsonBytes),
        "spoolmanJsonBytes must be Uint8Array"
      );

      return {
        records: [
          {
            recordType: "mime",
            mediaType: window.fcNfcConst.MIME.OPT,
            // Some Web NFC stacks are picky; ArrayBuffer tends to be the most compatible.
            data: params.optPayloadBytes.buffer.slice(
              params.optPayloadBytes.byteOffset,
              params.optPayloadBytes.byteOffset +
                params.optPayloadBytes.byteLength
            ),
          },
          {
            recordType: "mime",
            mediaType: window.fcNfcConst.MIME.FC_SPOOLMAN,
            data: params.spoolmanJsonBytes.buffer.slice(
              params.spoolmanJsonBytes.byteOffset,
              params.spoolmanJsonBytes.byteOffset +
                params.spoolmanJsonBytes.byteLength
            ),
          },
        ],
      };
    }

    static parse(ndefMessage) {
      const warnings = [];
      const records = (ndefMessage && ndefMessage.records) || [];

      const optRec = findMimeRecord(records, window.fcNfcConst.MIME.OPT);
      const spoolRec = findMimeRecord(
        records,
        window.fcNfcConst.MIME.FC_SPOOLMAN
      );

      let opt = null;
      let spool = null;

      if (!spoolRec) {
        warnings.push("Missing Filament-Chamber spool link record");
      } else {
        try {
          spool = window.fcRecords.parseSpoolmanLinkRecord(spoolRec);
        } catch (e) {
          warnings.push("Invalid spool link record: " + e.message);
        }
      }

      if (!optRec) {
        warnings.push("Missing OPT record");
      } else {
        try {
          const optBytes = window.fcRecords.recordDataToBytes(optRec);
          opt = window.fcOpt.OptPayload.parse(optBytes);
        } catch (e) {
          warnings.push("Invalid OPT payload: " + e.message);
        }
      }

      return {
        opt,
        spool_id: spool ? spool.spool_id : null,
        warnings,
      };
    }
  }

  class LocationTag {
    static init(params) {
      const location = params && params.location;
      const locJson = window.fcRecords.encodeLocationLinkPayload(location);
      return { locationJsonBytes: locJson };
    }

    static buildNdefWriteMessage(params) {
      assert(
        params && isUint8Array(params.locationJsonBytes),
        "locationJsonBytes must be Uint8Array"
      );
      return {
        records: [
          {
            recordType: "mime",
            mediaType: window.fcNfcConst.MIME.FC_LOCATION,
            data: params.locationJsonBytes.buffer.slice(
              params.locationJsonBytes.byteOffset,
              params.locationJsonBytes.byteOffset +
                params.locationJsonBytes.byteLength
            ),
          },
        ],
      };
    }

    static parse(ndefMessage) {
      const warnings = [];
      const records = (ndefMessage && ndefMessage.records) || [];
      const locRec = findMimeRecord(
        records,
        window.fcNfcConst.MIME.FC_LOCATION
      );
      if (!locRec) {
        warnings.push("Missing Filament-Chamber location record");
        return { location: null, warnings };
      }
      try {
        const loc = window.fcRecords.parseLocationLinkRecord(locRec);
        return { location: loc.location, warnings };
      } catch (e) {
        warnings.push("Invalid location record: " + e.message);
        return { location: null, warnings };
      }
    }
  }

  window.fcTagModels = {
    SpoolTag,
    LocationTag,
  };
})();
