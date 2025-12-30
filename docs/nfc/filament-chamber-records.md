# Filament-Chamber custom NDEF records (Spoolman linkage)

This project uses OpenPrintTag (OPT) for spool/material data **plus** our own NDEF records to link tags to Spoolman entities.

See also:

- OPT data format (upstream): `https://specs.openprinttag.org/#/nfc_data_format`
- Local OPT summary: `server/docs/nfc/openprinttag.md`

## Design goals

- Keep OPT data **standards-compliant** (do not misuse OPT vendor-specific CBOR key ranges).
- Keep our data **easy to parse from Web NFC** (single MIME record, UTF-8 JSON).
- Keep our data **versioned and extensible** (schema string + version int + forward-compatible parsing).

## Record identifiers

We use MIME records with these media types:

- Spool linkage: `application/vnd.filament-chamber.spoolman+json`
- Location linkage: `application/vnd.filament-chamber.location+json`

## Encoding rules (both records)

- NDEF record type: `recordType: "mime"`
- NDEF record media type: one of the MIME types above.
- Payload: **UTF-8 encoded JSON object** (no BOM).
- Parsing:
  - Read **all** NDEF records.
  - Select by `recordType === "mime"` and `mediaType` matching exactly.
  - Ignore unknown records.
  - Ignore unknown JSON fields.
  - If `version` is higher than supported, treat as “unknown version” (fail gracefully).

## Spoolman spool-link record (spool tags)

### When used

On **spool tags**, alongside the OPT record (`application/vnd.openprinttag`).

### JSON payload (v1)

```json
{
  "schema": "filament-chamber.spoolman",
  "version": 1,
  "spool_id": 123
}
```

Field meanings:

- `schema` (string, required): Must be exactly `filament-chamber.spoolman`
- `version` (int, required): Must be `1` for this spec version
- `spool_id` (int, required): Spoolman spool ID (Spoolman API uses integer `spool_id` path param)

Validation:

- `spool_id` must be a positive integer.

## Location-link record (location tags)

### Spoolman “location” note

In the Spoolman API version vendored in this repo, locations are **strings**, not numeric IDs:

- `GET /location` returns an array of location names (strings)
- Spool `location` field is a string (max length 64, nullable)

So our location tag stores the **location string** used by Spoolman.

### JSON payload (v1)

```json
{
  "schema": "filament-chamber.location",
  "version": 1,
  "location": "Shelf A / R2C3"
}
```

Field meanings:

- `schema` (string, required): Must be exactly `filament-chamber.location`
- `version` (int, required): Must be `1`
- `location` (string, required): Spoolman location string (as used by Spoolman spool `location`)

Validation:

- `location` must be non-empty after trimming.
- Recommended: keep `location.length <= 64` to match Spoolman’s spool schema constraints.

## Recommended full NDEF layouts

### Spool tag

An NDEF message containing (order-independent):

- OPT record:
  - MIME `application/vnd.openprinttag`
  - binary payload per OPT
- Filament-Chamber spool link record:
  - MIME `application/vnd.filament-chamber.spoolman+json`
  - JSON payload with `spool_id`

### Location tag

An NDEF message containing:

- Filament-Chamber location link record:
  - MIME `application/vnd.filament-chamber.location+json`
  - JSON payload with `location`

## Security / trust model

- NFC tags are **not authentication**. Assume tags can be cloned or rewritten.
- Treat tag contents as _inputs_; validate before applying changes to Spoolman.
