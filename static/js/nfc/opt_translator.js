// OpenPrintTag Translation Utilities (no bundler; classic script)
// Translates CBOR numeric keys and enum values to human-readable format
(function () {
  "use strict";

  // Main section field mappings (key -> field name)
  const MAIN_FIELDS = {
    0: "instance_uuid",
    1: "package_uuid",
    2: "material_uuid",
    3: "brand_uuid",
    4: "gtin",
    5: "brand_specific_instance_id",
    6: "brand_specific_package_id",
    7: "brand_specific_material_id",
    8: "material_class",
    9: "material_type",
    10: "material_name",
    11: "brand_name",
    13: "write_protection",
    14: "manufactured_date",
    15: "expiration_date",
    16: "nominal_netto_full_weight",
    17: "actual_netto_full_weight",
    18: "empty_container_weight",
    19: "primary_color",
    20: "secondary_color_0",
    21: "secondary_color_1",
    22: "secondary_color_2",
    23: "secondary_color_3",
    24: "secondary_color_4",
    27: "transmission_distance",
    28: "tags",
    29: "density",
    30: "filament_diameter",
    31: "shore_hardness_a",
    32: "shore_hardness_d",
    33: "min_nozzle_diameter",
    34: "min_print_temperature",
    35: "max_print_temperature",
    36: "preheat_temperature",
    37: "min_bed_temperature",
    38: "max_bed_temperature",
    39: "min_chamber_temperature",
    40: "max_chamber_temperature",
    41: "chamber_temperature",
    42: "container_width",
    43: "container_outer_diameter",
    44: "container_inner_diameter",
    45: "container_hole_diameter",
    46: "viscosity_18c",
    47: "viscosity_25c",
    48: "viscosity_40c",
    49: "viscosity_60c",
    50: "container_volumetric_capacity",
    51: "cure_wavelength",
    52: "material_abbreviation",
    53: "nominal_full_length",
    54: "actual_full_length",
    55: "country_of_origin",
    56: "certifications",
  };

  // Auxiliary section field mappings
  const AUX_FIELDS = {
    0: "consumed_weight",
    1: "workgroup",
    2: "general_purpose_range_user",
    3: "last_stir_time",
  };

  // Material class enum
  const MATERIAL_CLASS = {
    0: "FFF",
    1: "SLA",
  };

  // Material type enum
  const MATERIAL_TYPE = {
    0: "PLA",
    1: "PETG",
    2: "TPU",
    3: "ABS",
    4: "ASA",
    5: "PC",
    6: "PCTG",
    7: "PP",
    8: "PA6",
    9: "PA11",
    10: "PA12",
    11: "PA66",
    12: "CPE",
    13: "TPE",
    14: "HIPS",
    15: "PHA",
    16: "PET",
    17: "PEI",
    18: "PBT",
    19: "PVB",
    20: "PVA",
    21: "PEKK",
    22: "PEEK",
    23: "BVOH",
    24: "TPC",
    25: "PPS",
    26: "PPSU",
    27: "PVC",
    28: "PEBA",
    29: "PVDF",
    30: "PPA",
    31: "PCL",
    32: "PES",
    33: "PMMA",
    34: "POM",
    35: "PPE",
    36: "PS",
    37: "PSU",
    38: "TPI",
    39: "SBS",
    40: "OBC",
  };

  // Write protection enum
  const WRITE_PROTECTION = {
    0: "no",
    1: "irreversible",
    2: "protect_page_unlockable",
  };

  // Material certifications enum
  const MATERIAL_CERTIFICATIONS = {
    0: "ul_2818",
    1: "ul_94_v0",
  };

  // Tags enum (material properties)
  const TAGS = {
    0: "filtration_recommended",
    1: "biocompatible",
    2: "antibacterial",
    3: "air_filtering",
    4: "abrasive",
    5: "foaming",
    6: "self_extinguishing",
    7: "paramagnetic",
    8: "radiation_shielding",
    9: "high_temperature",
    10: "esd_safe",
    11: "conductive",
    12: "blend",
    13: "water_soluble",
    14: "ipa_soluble",
    15: "limonene_soluble",
    16: "matte",
    17: "silk",
    19: "translucent",
    20: "transparent",
    21: "iridescent",
    22: "pearlescent",
    23: "glitter",
    24: "glow_in_the_dark",
    25: "neon",
    26: "illuminescent_color_change",
    27: "temperature_color_change",
    28: "gradual_color_change",
    29: "coextruded",
    30: "contains_carbon",
    31: "contains_carbon_fiber",
    32: "contains_carbon_nano_tubes",
    33: "contains_glass",
    34: "contains_glass_fiber",
    35: "contains_kevlar",
    36: "contains_stone",
    37: "contains_magnetite",
    38: "contains_organic_material",
    39: "contains_cork",
    40: "contains_wax",
    41: "contains_wood",
    42: "contains_bamboo",
    43: "contains_pine",
    44: "contains_ceramic",
    45: "contains_boron_carbide",
    46: "contains_metal",
    47: "contains_bronze",
    48: "contains_iron",
    49: "contains_steel",
    50: "contains_silver",
    51: "contains_copper",
    52: "contains_aluminium",
    53: "contains_brass",
    54: "contains_tungsten",
    55: "imitates_wood",
    56: "imitates_metal",
    57: "imitates_marble",
    58: "imitates_stone",
    59: "lithophane",
    60: "recycled",
    61: "home_compostable",
    62: "industrially_compostable",
    63: "bio_based",
    64: "low_outgassing",
    65: "without_pigments",
    66: "contains_algae",
    67: "castable",
    68: "contains_ptfe",
    69: "limited_edition",
    70: "emi_shielding",
  };

  /**
   * Convert color bytes (RGB or RGBA) to hex string
   */
  function colorBytesToHex(bytes) {
    if (!bytes || !(bytes instanceof Uint8Array)) return null;
    let hex = "#";
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  /**
   * Translate a value based on field type
   */
  function translateValue(fieldName, value) {
    if (value === null || value === undefined) return value;

    // Enums
    if (fieldName === "material_class") {
      return typeof value === "number" ? MATERIAL_CLASS[value] || value : value;
    }
    if (fieldName === "material_type") {
      return typeof value === "number" ? MATERIAL_TYPE[value] || value : value;
    }
    if (fieldName === "write_protection") {
      return typeof value === "number"
        ? WRITE_PROTECTION[value] || value
        : value;
    }

    // Color fields
    if (
      fieldName === "primary_color" ||
      fieldName.startsWith("secondary_color_")
    ) {
      if (value instanceof Uint8Array) {
        return colorBytesToHex(value);
      }
      return value;
    }

    // Tags array (enum array)
    if (fieldName === "tags" && Array.isArray(value)) {
      return value.map((tag) =>
        typeof tag === "number" ? TAGS[tag] || tag : tag
      );
    }

    // Certifications array (enum array)
    if (fieldName === "certifications" && Array.isArray(value)) {
      return value.map((cert) =>
        typeof cert === "number" ? MATERIAL_CERTIFICATIONS[cert] || cert : cert
      );
    }

    // Timestamps (convert to ISO string if needed)
    if (
      (fieldName === "manufactured_date" ||
        fieldName === "expiration_date" ||
        fieldName === "last_stir_time") &&
      typeof value === "number"
    ) {
      // Assuming Unix timestamp in seconds
      return new Date(value * 1000).toISOString();
    }

    return value;
  }

  /**
   * Translate a CBOR map (Map object) to human-readable object
   */
  function translateMap(map, fieldMapping) {
    if (!map || !(map instanceof Map)) return null;

    const result = {};
    for (const [key, value] of map.entries()) {
      const fieldName = fieldMapping[key];
      if (fieldName) {
        result[fieldName] = translateValue(fieldName, value);
      } else {
        // Unknown field, keep numeric key
        result[`unknown_${key}`] = value;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * Main translation function: converts OPT payload object to readable format
   * @param {Object} optObject - The OPT payload object from OptPayload.toObject()
   * @returns {Object} Translated object with both raw and readable data
   */
  function translateOptToReadable(optObject) {
    if (!optObject) return null;

    const result = {
      raw: {
        meta: optObject.meta || null,
        main: optObject.main || null,
        aux: optObject.aux || null,
      },
      readable: {},
    };

    // Parse main section from the actual Map objects if available
    // The optObject from toObject() has string keys, but we need the actual Maps
    // So we need to work with the Maps directly from the OptPayload instance
    return result;
  }

  /**
   * Translate OptPayload instance directly (preferred method)
   * @param {OptPayload} optPayload - The OptPayload instance
   * @returns {Object} Object with raw and readable data
   */
  function translateOptPayload(optPayload) {
    if (!optPayload) return null;

    // Check if it's an OptPayload instance with the expected methods
    if (
      typeof optPayload.getMainMap !== "function" ||
      typeof optPayload.getAuxMap !== "function" ||
      typeof optPayload.toObject !== "function"
    ) {
      console.warn(
        "translateOptPayload: received object without OptPayload methods",
        optPayload
      );
      return null;
    }

    const mainMap = optPayload.getMainMap();
    const auxMap = optPayload.getAuxMap();

    const result = {
      raw: optPayload.toObject(),
      readable: {},
    };

    // Translate main section
    const mainReadable = translateMap(mainMap, MAIN_FIELDS);
    if (mainReadable) {
      result.readable.main = mainReadable;
    }

    // Translate aux section
    const auxReadable = translateMap(auxMap, AUX_FIELDS);
    if (auxReadable) {
      result.readable.aux = auxReadable;
    }

    return result;
  }

  // Export to global namespace
  window.fcOptTranslator = {
    translateOptPayload,
    translateOptToReadable,
    MAIN_FIELDS,
    AUX_FIELDS,
    MATERIAL_CLASS,
    MATERIAL_TYPE,
    WRITE_PROTECTION,
    MATERIAL_CERTIFICATIONS,
    TAGS,
  };
})();
