// Minimal CBOR codec for OPT usage (no deps; classic script)
// Supports: unsigned/negative ints, byte strings, text strings (UTF-8),
// arrays, maps, floats (f32/f64), simple values (true/false/null).
(function () {
  "use strict";

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }

  function isUint8Array(x) {
    return x && x.constructor === Uint8Array;
  }

  function concatBytes(chunks) {
    let total = 0;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }

  function encodeUtf8(str) {
    return new TextEncoder().encode(str);
  }

  function decodeUtf8(bytes) {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  function u8(n) {
    return new Uint8Array([n & 0xff]);
  }

  function be16(n) {
    return new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
  }

  function be32(n) {
    return new Uint8Array([
      (n >>> 24) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 8) & 0xff,
      n & 0xff,
    ]);
  }

  function be64FromBigInt(bi) {
    const out = new Uint8Array(8);
    let v = BigInt(bi);
    for (let i = 7; i >= 0; i--) {
      out[i] = Number(v & 0xffn);
      v >>= 8n;
    }
    return out;
  }

  function encodeHead(major, addl) {
    return u8((major << 5) | (addl & 0x1f));
  }

  function encodeUintHead(major, n) {
    if (typeof n === "bigint") {
      // Only support up to 64-bit for now.
      assert(n >= 0n && n <= 0xffffffffffffffffn, "CBOR uint out of range");
      if (n <= 23n) return encodeHead(major, Number(n));
      if (n <= 0xffn)
        return concatBytes([encodeHead(major, 24), u8(Number(n))]);
      if (n <= 0xffffn)
        return concatBytes([encodeHead(major, 25), be16(Number(n))]);
      if (n <= 0xffffffffn)
        return concatBytes([encodeHead(major, 26), be32(Number(n))]);
      return concatBytes([encodeHead(major, 27), be64FromBigInt(n)]);
    }

    assert(Number.isFinite(n) && n >= 0, "CBOR uint must be >= 0");
    if (n <= 23) return encodeHead(major, n);
    if (n <= 0xff) return concatBytes([encodeHead(major, 24), u8(n)]);
    if (n <= 0xffff) return concatBytes([encodeHead(major, 25), be16(n)]);
    if (n <= 0xffffffff) return concatBytes([encodeHead(major, 26), be32(n)]);
    // Use BigInt for 64-bit
    return encodeUintHead(major, BigInt(Math.trunc(n)));
  }

  function encodeInt(n) {
    assert(Number.isFinite(n), "CBOR int must be finite");
    if (Number.isInteger(n)) {
      if (n >= 0) return encodeUintHead(0, n);
      // Negative int major 1 stores (-1 - n) as uint
      return encodeUintHead(1, -1 - n);
    }
    // For non-integer numbers, encode float64
    return encodeFloat64(n);
  }

  function encodeFloat32(n) {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, n, false);
    return concatBytes([encodeHead(7, 26), new Uint8Array(buf)]);
  }

  function encodeFloat64(n) {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, n, false);
    return concatBytes([encodeHead(7, 27), new Uint8Array(buf)]);
  }

  function encodeBytes(b) {
    assert(isUint8Array(b), "CBOR bytes must be Uint8Array");
    return concatBytes([encodeUintHead(2, b.length), b]);
  }

  function encodeText(s) {
    const b = encodeUtf8(String(s));
    return concatBytes([encodeUintHead(3, b.length), b]);
  }

  function encodeArray(arr) {
    assert(Array.isArray(arr), "CBOR array expected");
    const parts = [encodeUintHead(4, arr.length)];
    for (const v of arr) parts.push(encodeAny(v));
    return concatBytes(parts);
  }

  function encodeMap(map) {
    // Accept Map or plain object (string keys will be coerced)
    let entries = [];
    if (map instanceof Map) {
      entries = Array.from(map.entries());
    } else if (map && typeof map === "object" && !Array.isArray(map)) {
      entries = Object.keys(map).map((k) => [k, map[k]]);
    } else {
      throw new Error("CBOR map expected (Map or object)");
    }

    const parts = [encodeUintHead(5, entries.length)];
    for (const [k, v] of entries) {
      parts.push(encodeAny(k));
      parts.push(encodeAny(v));
    }
    return concatBytes(parts);
  }

  function encodeSimple(val) {
    if (val === false) return encodeHead(7, 20);
    if (val === true) return encodeHead(7, 21);
    if (val === null) return encodeHead(7, 22);
    throw new Error("Unsupported simple value");
  }

  function encodeAny(v) {
    if (v === null || v === true || v === false) return encodeSimple(v);
    if (typeof v === "number") return encodeInt(v);
    if (typeof v === "bigint") return encodeUintHead(0, v); // only non-negative used here
    if (typeof v === "string") return encodeText(v);
    if (isUint8Array(v)) return encodeBytes(v);
    if (Array.isArray(v)) return encodeArray(v);
    if (v instanceof Map) return encodeMap(v);
    if (v && typeof v === "object") return encodeMap(v);
    throw new Error("Unsupported CBOR type: " + typeof v);
  }

  function readUint(bytes, off, addl) {
    if (addl < 24) return { value: addl, read: 0 };
    if (addl === 24) return { value: bytes[off], read: 1 };
    if (addl === 25) {
      return { value: (bytes[off] << 8) | bytes[off + 1], read: 2 };
    }
    if (addl === 26) {
      const dv = new DataView(bytes.buffer, bytes.byteOffset + off, 4);
      return { value: dv.getUint32(0, false), read: 4 };
    }
    if (addl === 27) {
      // 64-bit. Return BigInt if it doesn't fit safe int.
      let bi = 0n;
      for (let i = 0; i < 8; i++) {
        bi = (bi << 8n) | BigInt(bytes[off + i]);
      }
      const asNum = Number(bi);
      if (Number.isSafeInteger(asNum)) return { value: asNum, read: 8 };
      return { value: bi, read: 8 };
    }
    throw new Error("Indefinite length not supported in cbor_min");
  }

  function decodeAny(bytes, offset) {
    assert(isUint8Array(bytes), "decode expects Uint8Array");
    assert(offset >= 0 && offset < bytes.length, "decode offset out of range");

    const ib = bytes[offset];
    const major = ib >> 5;
    const addl = ib & 0x1f;
    let cursor = offset + 1;

    // Major 0/1: int
    if (major === 0 || major === 1) {
      const { value: u, read } = readUint(bytes, cursor, addl);
      cursor += read;
      if (major === 0) return { value: u, bytesRead: cursor - offset };
      // negative: -1 - u
      if (typeof u === "bigint")
        return { value: -1n - u, bytesRead: cursor - offset };
      return { value: -1 - u, bytesRead: cursor - offset };
    }

    // Byte string / text string
    if (major === 2 || major === 3) {
      const { value: len, read } = readUint(bytes, cursor, addl);
      cursor += read;
      assert(typeof len === "number", "byte/text length too large");
      const end = cursor + len;
      assert(end <= bytes.length, "CBOR string out of range");
      const slice = bytes.slice(cursor, end);
      cursor = end;
      if (major === 2) return { value: slice, bytesRead: cursor - offset };
      return { value: decodeUtf8(slice), bytesRead: cursor - offset };
    }

    // Array
    if (major === 4) {
      const { value: len, read } = readUint(bytes, cursor, addl);
      cursor += read;
      assert(typeof len === "number", "array length too large");
      const arr = [];
      for (let i = 0; i < len; i++) {
        const d = decodeAny(bytes, cursor);
        arr.push(d.value);
        cursor += d.bytesRead;
      }
      return { value: arr, bytesRead: cursor - offset };
    }

    // Map
    if (major === 5) {
      const { value: len, read } = readUint(bytes, cursor, addl);
      cursor += read;
      assert(typeof len === "number", "map length too large");
      const map = new Map();
      for (let i = 0; i < len; i++) {
        const k = decodeAny(bytes, cursor);
        cursor += k.bytesRead;
        const v = decodeAny(bytes, cursor);
        cursor += v.bytesRead;
        map.set(k.value, v.value);
      }
      return { value: map, bytesRead: cursor - offset };
    }

    // Simple / floats
    if (major === 7) {
      if (addl === 20) return { value: false, bytesRead: 1 };
      if (addl === 21) return { value: true, bytesRead: 1 };
      if (addl === 22) return { value: null, bytesRead: 1 };

      if (addl === 26) {
        const dv = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4);
        const f = dv.getFloat32(0, false);
        return { value: f, bytesRead: 1 + 4 };
      }

      if (addl === 27) {
        const dv = new DataView(bytes.buffer, bytes.byteOffset + cursor, 8);
        const f = dv.getFloat64(0, false);
        return { value: f, bytesRead: 1 + 8 };
      }
    }

    throw new Error("Unsupported CBOR major/additional: " + major + "/" + addl);
  }

  window.fcCbor = {
    encode: encodeAny,
    decode: function (bytes, offset) {
      const off = offset || 0;
      return decodeAny(bytes, off);
    },
  };
})();
