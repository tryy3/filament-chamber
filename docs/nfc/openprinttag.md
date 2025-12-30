# OpenPrintTag (OPT) on NFC (quick internal reference)

This document summarizes the parts of the OpenPrintTag NFC data format we rely on when reading/writing tags from this project.

Primary references:

- OPT NFC spec: `https://specs.openprinttag.org/#/nfc_data_format`
- OPT repository: `https://github.com/prusa3d/OpenPrintTag/tree/main`
- OPT Python reference implementation (useful for edge cases): `https://github.com/prusa3d/OpenPrintTag/tree/main/utils`

## Local “pinned” OPT field/enums snapshot (use this first)

To reduce reliance on external sources, this repo vendors a snapshot of OPT’s machine-readable field definitions and enums:

- `server/docs/nfc/openprinttag-spec/`
  - `config_nfcv.yaml` / `config_noroot.yaml`
  - `meta_fields.yaml`
  - `main_fields.yaml`
  - `aux_fields.yaml`
  - enums used by `enum` / `enum_array` fields (e.g. `material_type_enum.yaml`, `tags_enum.yaml`, `write_protection_enum.yaml`, ...)

These files are copied from the upstream OPT repository’s `data/` directory (see `https://github.com/prusa3d/OpenPrintTag/tree/main/data`).

If you are implementing OPT support, you should be able to do it from the **local** `openprinttag-spec/*.yaml` without opening the upstream spec website.

For a human-friendly, table-form reference generated from that snapshot, see:

- `server/docs/nfc/openprinttag-field-reference.md`
- `server/docs/nfc/openprinttag-enum-reference.md`

## What we read/write at the NDEF level

### NDEF message

- The tag’s top layer is an **NDEF message** contained in an **NDEF TLV** record.
  - The tag **may** contain other TLVs; the NDEF TLV does **not** have to be first.
- The NDEF message contains **one MIME NDEF record** with media type:
  - `application/vnd.openprinttag`
  - The message may contain other NDEF records as well; the OPT record does not need to be first.
- The OPT record **MUST NOT be chunked** (must be a single NDEF record, not split across multiple chunks).

## OPT record payload structure (bytes)

The OPT MIME record payload is an allocated byte “virtual space” containing up to 3 sections:

1. **Meta section** (CBOR map) — always at the start of the payload.
2. **Main section** (CBOR map) — located at the start of the “main region”.
3. **Auxiliary section** (optional CBOR map) — located at the start of the “aux region”.

Unused bytes in the allocated regions are not meaningful and may contain zeroes or remnants of older data.

### Size constraint

- Each region’s allocated memory is limited by the spec: **each data section MUST be at most 512 bytes**.

## CBOR rules (applies to meta/main/aux)

- Each section is a **CBOR map**.
- Map keys are **integers**.
- Implementations must:
  - **Skip unknown keys** (any CBOR type).
  - **Not remove unknown keys** when updating known fields (unless explicitly intended).
  - Support **unsorted (non-canonical) maps**.
- Encoding guidance:
  - CBOR maps/arrays **should** be encoded as **indefinite containers**.

## Field definitions (how to interpret `openprinttag-spec/*_fields.yaml`)

OPT defines fields in YAML lists. Each list entry typically contains:

- `key` (int): CBOR map key (integer).
- `name` (string): Human-readable field name.
- `type` (string): One of:
  - `bool`, `int`, `number`
  - `string` with `max_length`
  - `timestamp` (stored as int UNIX timestamp)
  - `uuid` (stored as CBOR byte string)
  - `color_rgba` (stored as CBOR byte string of 3–4 bytes: RGB or RGBA)
  - `enum` / `enum_array` (integer(s) mapped via `items_file`)
- Optional metadata:
  - `required: true` (required) or `required: recommended` (recommended)
  - `unit` (e.g. `g`, `mm`, `mm/s`, `°C`, `bytes`, …)
  - `description` (string or list of strings)
  - `example`
  - `deprecated: true`
  - `category` (used for filtering/grouping in docs/UIs)

### Enums (`items_file`)

For `enum` / `enum_array` fields, the YAML includes `items_file: <something>.yaml` which lives in `server/docs/nfc/openprinttag-spec/`.

Important notes:

- The stored CBOR value is an **integer key** (or array of integer keys for `enum_array`).
- Enum item files can include additional metadata (e.g. display names, descriptions, tags implying other tags).
- Items can be marked `deprecated: true`; do not emit deprecated values when writing.

## Meta section (region layout)

The meta section defines offsets/sizes **relative to the start of the OPT payload**.

Fields (names per spec; keys are integers):

- `main_region_offset` (key `0`, int, bytes):
  - Offset of main region. If omitted: main region starts immediately after meta section.
- `main_region_size` (key `1`, int, bytes):
  - Allocation size of main region. If omitted: spans to next region or payload end.
- `aux_region_offset` (key `2`, int, bytes):
  - Offset of aux region. If omitted: aux region is not present.
- `aux_region_size` (key `3`, int, bytes):
  - Allocation size of aux region. If omitted: spans to next region or payload end.

## Main section (static material/package data)

The main section contains mostly static material information (can be manufacturer write-protected).

### “Most useful” main fields (quick list)

This is a curated list of fields you’ll almost always care about in UIs and scan flows. Full list is in `server/docs/nfc/openprinttag-spec/main_fields.yaml`.

- Identity / linking:
  - `instance_uuid` (key `0`, `uuid`)
  - `package_uuid` (key `1`, `uuid`)
  - `material_uuid` (key `2`, `uuid`)
  - `brand_uuid` (key `3`, `uuid`)
  - `gtin` (key `4`, `number`, recommended)
- “What is it?”:
  - `material_class` (key `8`, `enum`, required; `items_file: material_class_enum.yaml`)
  - `material_type` (key `9`, `enum`, recommended; `items_file: material_type_enum.yaml`)
  - `brand_name` (key `11`, `string`)
  - `material_name` (key `10`, `string`)
  - `material_abbreviation` (key `52`, `string`)
  - `tags` (type `enum_array`; `items_file: tags_enum.yaml`) — for properties like “abrasive”, “flexible”, etc.
- Manufacturing / lifecycle:
  - `manufactured_date` (key `14`, `timestamp`)
  - `expiration_date` (key `15`, `timestamp`)
  - `lot_nr` (string; vendor lot/batch number)
  - `country_of_origin` (string, ISO 3166-1 alpha-2)
- Filament geometry:
  - `filament_diameter` (number, `mm`)
  - `spool_width` / `spool_diameter` / other container geometry fields (varies by tag class; see YAML)
- Weight/length (advertised vs measured):
  - `nominal_netto_full_weight` / `actual_netto_full_weight` (number, `g`)
  - `nominal_full_length` / `actual_full_length` (number, `mm`)
- Temps:
  - `min_print_temperature` / `max_print_temperature` (number, `°C`)
  - `bed_temperature` or min/max bed temperature fields
  - `chamber_temperature` or min/max chamber temperature fields

For complete field details (keys, types, units, max lengths, and descriptions), use:

- `server/docs/nfc/openprinttag-spec/main_fields.yaml`

## Auxiliary section (dynamic usage data)

The auxiliary section is intended for dynamic updates (typically usage tracking).

### Auxiliary fields (full list)

The aux region fields are defined in:

- `server/docs/nfc/openprinttag-spec/aux_fields.yaml`

Examples:

- `consumed_weight` (key `0`, `number`, unit `g`)
- `workgroup` (key `1`, `string`, max length `8`)
- `general_purpose_range_user` (key `2`, `string`, max length `8`)

### Vendor-specific / general-purpose key ranges

OPT permits vendor-specific fields only in designated ranges (in the aux section), e.g.:

- `65400..65534`: “General purpose”
- `65300..65400`: “Prusa”

If using the general-purpose range, the spec requires correct use of `general_purpose_range_user` and additional rules (single owner at a time, clearing fields before changing owner, etc).

**We do not use these OPT vendor-specific CBOR ranges for Filament-Chamber/Spoolman linkage.** Instead, we store our linkage in separate NDEF records (see `filament-chamber-records.md`).

## UUID derivation (practical notes)

OPT defines that some UUIDs can be auto-derived (UUIDv5 / SHA1 namespaces) when not explicitly present in the main data. The reference Python `opt_check.py` also derives/checks these.

Important practical note: tag UIDs are sometimes reported in different byte orders by different apps/readers; for NFC-V, the UID should be 8 bytes and should start with `0xE0` (per OPT guidance).
