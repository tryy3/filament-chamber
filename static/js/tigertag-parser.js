/**
 * TigerTag RFID Parser
 * Parses binary data from TigerTag RFID tags according to the TigerTag specification
 * Based on: https://doc.tigertag.io/docs/format/layout
 * 
 * TigerTag uses NTAG213-compatible tags with 144 bytes of user memory
 * Memory layout: 36 pages × 4 bytes = 144 bytes total
 */

const TigerTagParser = {
  /**
   * Parse a TigerTag from raw memory bytes
   * @param {Uint8Array} rawMemory - Raw memory bytes from the tag (minimum 96 bytes)
   * @returns {Object|null} Parsed TigerTag data or null if parsing fails
   */
  parse: function(rawMemory) {
    try {
      // Validate minimum length (we need at least pages 4-27 = 96 bytes minimum)
      if (!rawMemory || rawMemory.length < 96) {
        console.error(`TigerTag: Insufficient data (${rawMemory?.length || 0} bytes, need at least 96)`);
        return null;
      }

      console.log(`TigerTag: Parsing ${rawMemory.length} bytes of memory`);

      // TigerTag data starts at page 4 (byte offset 16 in full memory dump)
      // But if we're given just the payload, it might start at byte 0
      // We'll try to auto-detect by looking for reasonable TigerTag ID values
      
      const dataView = new DataView(rawMemory.buffer, rawMemory.byteOffset, rawMemory.byteLength);
      
      // Try different offsets to find the start of TigerTag data
      let offset = this._findDataOffset(rawMemory);
      console.log(`TigerTag: Using byte offset ${offset}`);

      const tag = {
        // Core identification (Page 4)
        tigerTagID: this._readUint32BE(dataView, offset + 0),
        
        // Product information (Page 5)
        productID: this._readUint32LE(dataView, offset + 4),
        
        // Material and visual aspects (Page 6)
        materialID: this._readUint16LE(dataView, offset + 8),
        firstVisualAspectID: dataView.getUint8(offset + 10),
        secondVisualAspectID: dataView.getUint8(offset + 11),
        
        // Type and dimensions (Page 7)
        typeID: dataView.getUint8(offset + 12),
        diameterMillimeters: dataView.getUint8(offset + 13),
        lengthMeters: this._readUint16LE(dataView, offset + 14),
        
        // Color information (Page 8)
        colorRed: dataView.getUint8(offset + 16),
        colorGreen: dataView.getUint8(offset + 17),
        colorBlue: dataView.getUint8(offset + 18),
        colorAlpha: dataView.getUint8(offset + 19),
        
        // Weight and units (Page 9)
        netWeightGrams: this._readUint16LE(dataView, offset + 20),
        grossWeightGrams: this._readUint16LE(dataView, offset + 22),
        
        // Temperature settings (Page 10)
        temperatureMinCelsius: dataView.getUint8(offset + 24),
        temperatureMaxCelsius: dataView.getUint8(offset + 25),
        bedTemperatureCelsius: dataView.getUint8(offset + 26),
        fanSpeedPercent: dataView.getUint8(offset + 27),
        
        // Drying parameters (Page 11)
        dryingTemperatureCelsius: dataView.getUint8(offset + 28),
        dryingTimeHours: dataView.getUint8(offset + 29),
        reserved1: dataView.getUint8(offset + 30),
        reserved2: dataView.getUint8(offset + 31),
        
        // Manufacturing information (Page 12)
        manufacturingTimestamp: this._readUint32LE(dataView, offset + 32),
        
        // Batch and origin (Page 13)
        batchID: this._readUint16LE(dataView, offset + 36),
        manufacturingCountry: this._readUint16LE(dataView, offset + 38),
        
        // Brand information (Page 14)
        brandID: this._readUint16LE(dataView, offset + 40),
        reserved3: this._readUint16LE(dataView, offset + 42),
        
        // Additional metadata (Page 15)
        reserved4: this._readUint32LE(dataView, offset + 44),
        
        // Metadata section (Pages 16-23, 32 bytes)
        metadata: this._extractMetadata(rawMemory, offset + 48),
        
        // Signature section (Pages 24-39, 64 bytes) - if available
        signature: rawMemory.length >= offset + 112 ? 
          this._bytesToHex(rawMemory.slice(offset + 80, offset + 144)) : null,
      };

      // Add computed/formatted fields
      tag.colorHex = this._rgbToHex(tag.colorRed, tag.colorGreen, tag.colorBlue);
      tag.manufacturingDate = this._timestampToDate(tag.manufacturingTimestamp);
      tag.tigerTagIDHex = this._uint32ToHex(tag.tigerTagID);
      tag.productIDHex = this._uint32ToHex(tag.productID);

      console.log('TigerTag: Successfully parsed tag data');
      return tag;
      
    } catch (error) {
      console.error('TigerTag: Parse error:', error);
      return null;
    }
  },

  /**
   * Try to find the offset where TigerTag data starts
   * @private
   */
  _findDataOffset: function(rawMemory) {
    // If data starts with pages 0-3 (UID, lock bytes, etc), TigerTag data is at offset 16
    // If data is just the payload, it starts at offset 0
    // We can check by seeing if byte 0-3 look like a reasonable TigerTag ID
    
    if (rawMemory.length >= 20) {
      // Check if offset 16 has a non-zero TigerTag ID (pages 0-3 are present)
      const dataView = new DataView(rawMemory.buffer, rawMemory.byteOffset, rawMemory.byteLength);
      const idAt16 = this._readUint32BE(dataView, 16);
      if (idAt16 > 0 && idAt16 < 0xFFFFFFFF) {
        return 16; // Full memory dump
      }
    }
    
    return 0; // Payload only
  },

  /**
   * Read a 32-bit unsigned integer in big-endian format
   * @private
   */
  _readUint32BE: function(dataView, offset) {
    return dataView.getUint32(offset, false); // false = big-endian
  },

  /**
   * Read a 32-bit unsigned integer in little-endian format
   * @private
   */
  _readUint32LE: function(dataView, offset) {
    return dataView.getUint32(offset, true); // true = little-endian
  },

  /**
   * Read a 16-bit unsigned integer in little-endian format
   * @private
   */
  _readUint16LE: function(dataView, offset) {
    return dataView.getUint16(offset, true); // true = little-endian
  },

  /**
   * Extract and parse metadata section
   * @private
   */
  _extractMetadata: function(rawMemory, offset) {
    if (rawMemory.length < offset + 32) {
      return null;
    }
    
    const metadataBytes = rawMemory.slice(offset, offset + 32);
    return {
      raw: this._bytesToHex(metadataBytes),
      bytes: Array.from(metadataBytes)
    };
  },

  /**
   * Convert bytes to hex string
   * @private
   */
  _bytesToHex: function(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  },

  /**
   * Convert uint32 to hex string
   * @private
   */
  _uint32ToHex: function(value) {
    return '0x' + value.toString(16).padStart(8, '0').toUpperCase();
  },

  /**
   * Convert RGB to hex color string
   * @private
   */
  _rgbToHex: function(r, g, b) {
    return '#' + [r, g, b]
      .map(c => c.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  },

  /**
   * Convert Unix timestamp to readable date
   * @private
   */
  _timestampToDate: function(timestamp) {
    if (timestamp === 0 || timestamp === 0xFFFFFFFF) {
      return null;
    }
    try {
      return new Date(timestamp * 1000).toISOString();
    } catch (e) {
      return null;
    }
  },

  /**
   * Pretty print parsed TigerTag data to console
   * @param {Object} tag - Parsed TigerTag data
   */
  prettyPrint: function(tag) {
    if (!tag) {
      console.log('TigerTag: No data to print');
      return;
    }

    console.log('\n=== TigerTag Parsed Data ===');
    console.log('Core Identification:');
    console.log(`  TigerTag ID: ${tag.tigerTagID} (${tag.tigerTagIDHex})`);
    console.log(`  Product ID: ${tag.productID} (${tag.productIDHex})`);
    
    console.log('\nMaterial & Type:');
    console.log(`  Material ID: ${tag.materialID}`);
    console.log(`  Type ID: ${tag.typeID}`);
    console.log(`  Visual Aspects: ${tag.firstVisualAspectID}, ${tag.secondVisualAspectID}`);
    
    console.log('\nDimensions:');
    console.log(`  Diameter: ${tag.diameterMillimeters}mm`);
    console.log(`  Length: ${tag.lengthMeters}m`);
    console.log(`  Net Weight: ${tag.netWeightGrams}g`);
    console.log(`  Gross Weight: ${tag.grossWeightGrams}g`);
    
    console.log('\nColor:');
    console.log(`  RGBA: (${tag.colorRed}, ${tag.colorGreen}, ${tag.colorBlue}, ${tag.colorAlpha})`);
    console.log(`  Hex: ${tag.colorHex}`);
    
    console.log('\nPrint Settings:');
    console.log(`  Temperature Range: ${tag.temperatureMinCelsius}°C - ${tag.temperatureMaxCelsius}°C`);
    console.log(`  Bed Temperature: ${tag.bedTemperatureCelsius}°C`);
    console.log(`  Fan Speed: ${tag.fanSpeedPercent}%`);
    
    console.log('\nDrying:');
    console.log(`  Temperature: ${tag.dryingTemperatureCelsius}°C`);
    console.log(`  Time: ${tag.dryingTimeHours} hours`);
    
    console.log('\nManufacturing:');
    console.log(`  Date: ${tag.manufacturingDate || 'Not set'}`);
    console.log(`  Batch ID: ${tag.batchID}`);
    console.log(`  Country: ${tag.manufacturingCountry}`);
    console.log(`  Brand ID: ${tag.brandID}`);
    
    if (tag.metadata) {
      console.log('\nMetadata:');
      console.log(`  ${tag.metadata.raw}`);
    }
    
    if (tag.signature) {
      console.log('\nSignature:');
      console.log(`  ${tag.signature.substring(0, 32)}...`);
    }
    
    console.log('============================\n');
  }
};

// Make it available globally
window.TigerTagParser = TigerTagParser;

