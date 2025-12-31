// Web NFC wrapper (no bundler; classic script)
(function () {
  "use strict";

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }

  function isSupported() {
    return "NDEFReader" in window;
  }

  let isWriting = false;

  async function scanOnce(params) {
    assert(isSupported(), "Web NFC (NDEFReader) not supported in this browser");
    const timeoutMs =
      (params && params.timeoutMs) ||
      window.fcNfcConst.DEFAULTS.SCAN_TIMEOUT_MS;

    const ndef = new NDEFReader();
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
    try {
      await ndef.scan({ signal: controller.signal });
      return await new Promise((resolve, reject) => {
        ndef.onreadingerror = () => reject(new Error("NFC read failed"));
        ndef.onreading = (evt) => {
          clearTimeout(timer);
          try {
            controller.abort("done");
          } catch (_) {}
          resolve(evt);
        };
      });
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  async function writeMessage(message, opts) {
    assert(isSupported(), "Web NFC (NDEFReader) not supported in this browser");
    if (isWriting) {
      throw new Error("Another NFC write is already in progress");
    }
    const ndef = new NDEFReader();
    isWriting = true;
    try {
      // Force overwrite to avoid any append/merge behavior differences across stacks.
      const options = Object.assign({ overwrite: true }, opts || {});
      await ndef.write(message, options);
    } finally {
      isWriting = false;
    }
  }

  window.fcWebNfc = {
    isSupported,
    scanOnce,
    writeMessage,
  };
})();
