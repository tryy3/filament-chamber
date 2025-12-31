// OpenPrintTag (OPT) payload model (no bundler; classic script)
// Based on local docs: server/docs/nfc/openprinttag.md
(function () {
  "use strict";

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }

  function isUint8Array(x) {
    return x && x.constructor === Uint8Array;
  }

  function zeroFill(buf, start, len) {
    buf.fill(0, start, start + len);
  }

  function mapGetNumber(map, key) {
    if (!(map instanceof Map)) return undefined;
    if (!map.has(key)) return undefined;
    const v = map.get(key);
    if (typeof v === "number") return v;
    return undefined;
  }

  function ensureMap(x) {
    if (x instanceof Map) return x;
    if (!x) return new Map();
    if (typeof x === "object" && !Array.isArray(x)) {
      const m = new Map();
      for (const k of Object.keys(x)) m.set(Number(k), x[k]);
      return m;
    }
    throw new Error("Expected Map or object");
  }

  /**
   * OptPayload represents the entire OPT record payload bytes and decoded views.
   * It preserves unknown keys by keeping full decoded maps and re-encoding them.
   */
  class OptPayload {
    constructor(opts) {
      this.payload = opts.payload; // Uint8Array
      this.meta = opts.meta; // Map
      this.main = opts.main; // Map
      this.aux = opts.aux; // Map|null

      this.metaLen = opts.metaLen; // number
      this.mainOffset = opts.mainOffset; // number
      this.mainSize = opts.mainSize; // number
      this.auxOffset = opts.auxOffset; // number|null
      this.auxSize = opts.auxSize; // number|null
    }

    static init(params) {
      const requestedPayloadSize =
        params && typeof params.payloadSize === "number"
          ? params.payloadSize
          : undefined;
      const auxSize =
        params && typeof params.auxSize === "number"
          ? params.auxSize
          : window.fcNfcConst.DEFAULTS.AUX_REGION_BYTES;

      assert(
        Number.isInteger(auxSize) && auxSize >= 0,
        "auxSize must be integer >= 0"
      );

      // OPT spec: each section must be <= 512 bytes
      assert(auxSize === 0 || auxSize <= 512, "auxSize must be <= 512");

      // Initialize main and aux as empty maps.
      const emptyMapBytes = window.fcCbor.encode(new Map());
      assert(emptyMapBytes.length > 0, "empty map encoding failed");

      // COMPACT INIT (default): meta + main (+ optional aux), no padding.
      // This minimizes write time/IO errors on some Android stacks.
      if (requestedPayloadSize === undefined) {
        // No aux by default: payload is just [metaMap][mainMap]
        if (auxSize <= 0) {
          const metaBytes = window.fcCbor.encode(new Map());
          const payload = new Uint8Array(metaBytes.length + emptyMapBytes.length);
          payload.set(metaBytes, 0);
          payload.set(emptyMapBytes, metaBytes.length);
          return OptPayload.parse(payload);
        }

        // If aux requested, include an aux map and set aux_region_offset/size.
        // We allocate only enough for the empty aux map. If you need more space later,
        // rewrite with an explicit payloadSize (preallocated mode).
        let metaBytes = null;
        let auxOffset = 0;
        for (let i = 0; i < 4; i++) {
          const tmpMeta = new Map();
          tmpMeta.set(2, auxOffset);
          tmpMeta.set(3, emptyMapBytes.length);
          const tmpMetaBytes = window.fcCbor.encode(tmpMeta);
          const computedAuxOffset = tmpMetaBytes.length + emptyMapBytes.length;
          if (computedAuxOffset === auxOffset) {
            metaBytes = tmpMetaBytes;
            break;
          }
          auxOffset = computedAuxOffset;
        }
        assert(metaBytes, "Failed to stabilize compact aux offset");
        const mainOffset = metaBytes.length;
        const finalAuxOffset = mainOffset + emptyMapBytes.length;
        const payload = new Uint8Array(metaBytes.length + emptyMapBytes.length + emptyMapBytes.length);
        payload.set(metaBytes, 0);
        payload.set(emptyMapBytes, mainOffset);
        payload.set(emptyMapBytes, finalAuxOffset);
        return OptPayload.parse(payload);
      }

      // PREALLOCATED INIT (advanced): allocate a padded virtual space of payloadSize bytes.
      const payloadSize = requestedPayloadSize;
      assert(
        Number.isInteger(payloadSize) && payloadSize > 16,
        "payloadSize must be integer > 16"
      );
      assert(payloadSize <= 512 * 3, "payloadSize seems unreasonably large");

      const payload = new Uint8Array(payloadSize);
      payload.fill(0);

      // Reserve aux region at end if requested.
      const hasAux = auxSize > 0;
      const auxOffset = hasAux ? payloadSize - auxSize : null;

      // Meta map: only set aux offsets/sizes; main offset is implicit if omitted.
      const meta = new Map();
      if (hasAux) {
        meta.set(2, auxOffset);
        meta.set(3, auxSize);
      }

      // Encode meta (definite containers; our encoder only does definite).
      const metaBytes = window.fcCbor.encode(meta);
      assert(metaBytes.length <= 512, "meta section too large");
      payload.set(metaBytes, 0);

      const metaLen = metaBytes.length;
      const mainOffset = metaLen; // implicit per spec when main_region_offset omitted
      assert(mainOffset < payloadSize, "mainOffset out of range");

      payload.set(emptyMapBytes, mainOffset);
      if (hasAux) payload.set(emptyMapBytes, auxOffset);

      const endForMain = hasAux ? auxOffset : payloadSize;
      const mainSize = endForMain - mainOffset;
      assert(mainSize > 0, "main region too small");
      assert(mainSize <= 512, "main region allocation must be <= 512 bytes");

      return OptPayload.parse(payload);
    }

    static parse(payloadBytes) {
      assert(isUint8Array(payloadBytes), "OPT payload must be Uint8Array");

      // Meta is always at start.
      const metaDecoded = window.fcCbor.decode(payloadBytes, 0);
      assert(
        metaDecoded.value instanceof Map,
        "OPT meta must decode to CBOR map"
      );
      const meta = metaDecoded.value;
      const metaLen = metaDecoded.bytesRead;

      const auxOffset = mapGetNumber(meta, 2);
      const auxSize = mapGetNumber(meta, 3);

      const mainOffset = mapGetNumber(meta, 0) ?? metaLen;
      const mainRegionEnd =
        typeof auxOffset === "number" ? auxOffset : payloadBytes.length;
      const mainSize = mapGetNumber(meta, 1) ?? mainRegionEnd - mainOffset;

      assert(
        mainOffset >= 0 && mainOffset < payloadBytes.length,
        "mainOffset out of range"
      );
      assert(mainSize > 0, "mainSize invalid");
      assert(
        mainOffset + mainSize <= payloadBytes.length,
        "main region exceeds payload"
      );

      const mainDecoded = window.fcCbor.decode(payloadBytes, mainOffset);
      assert(
        mainDecoded.value instanceof Map,
        "OPT main must decode to CBOR map"
      );
      const main = mainDecoded.value;

      let aux = null;
      if (typeof auxOffset === "number") {
        assert(
          typeof auxSize === "number" && auxSize > 0,
          "aux_region_size missing/invalid"
        );
        assert(
          auxOffset >= 0 && auxOffset < payloadBytes.length,
          "auxOffset out of range"
        );
        assert(
          auxOffset + auxSize <= payloadBytes.length,
          "aux region exceeds payload"
        );
        const auxDecoded = window.fcCbor.decode(payloadBytes, auxOffset);
        assert(
          auxDecoded.value instanceof Map,
          "OPT aux must decode to CBOR map"
        );
        aux = auxDecoded.value;
      }

      return new OptPayload({
        payload: payloadBytes,
        meta,
        main,
        aux,
        metaLen,
        mainOffset,
        mainSize,
        auxOffset: typeof auxOffset === "number" ? auxOffset : null,
        auxSize: typeof auxSize === "number" ? auxSize : null,
      });
    }

    getMetaMap() {
      return this.meta;
    }

    getMainMap() {
      return this.main;
    }

    getAuxMap() {
      return this.aux;
    }

    setMainKey(intKey, value) {
      assert(Number.isInteger(intKey), "OPT main key must be integer");
      this.main.set(intKey, value);
      this._rewriteRegion("main");
    }

    setAuxKey(intKey, value) {
      assert(Number.isInteger(intKey), "OPT aux key must be integer");
      assert(this.aux, "No aux region present");
      this.aux.set(intKey, value);
      this._rewriteRegion("aux");
    }

    _rewriteRegion(which) {
      if (which === "main") {
        const regionStart = this.mainOffset;
        const regionLen = this.mainSize;
        const enc = window.fcCbor.encode(this.main);
        assert(
          enc.length <= regionLen,
          "Encoded main map exceeds main region allocation"
        );
        zeroFill(this.payload, regionStart, regionLen);
        this.payload.set(enc, regionStart);
        return;
      }

      if (which === "aux") {
        assert(
          this.aux &&
            typeof this.auxOffset === "number" &&
            typeof this.auxSize === "number",
          "No aux region"
        );
        const regionStart = this.auxOffset;
        const regionLen = this.auxSize;
        const enc = window.fcCbor.encode(this.aux);
        assert(
          enc.length <= regionLen,
          "Encoded aux map exceeds aux region allocation"
        );
        zeroFill(this.payload, regionStart, regionLen);
        this.payload.set(enc, regionStart);
        return;
      }

      throw new Error("Unknown region: " + which);
    }

    toBytes() {
      return this.payload;
    }

    // Convenience for debugging: convert maps to plain objects (integer keys become strings)
    toObject() {
      const mapToObj = (m) => {
        if (!m) return null;
        const o = {};
        for (const [k, v] of m.entries()) o[String(k)] = v;
        return o;
      };
      return {
        meta: mapToObj(this.meta),
        main: mapToObj(this.main),
        aux: mapToObj(this.aux),
        layout: {
          metaLen: this.metaLen,
          mainOffset: this.mainOffset,
          mainSize: this.mainSize,
          auxOffset: this.auxOffset,
          auxSize: this.auxSize,
          payloadSize: this.payload.length,
        },
      };
    }
  }

  window.fcOpt = {
    OptPayload,
  };
})();
