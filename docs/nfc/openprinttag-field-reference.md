# OpenPrintTag field reference (vendored snapshot)

This file is generated from the YAML snapshot in `docs/nfc/openprinttag-spec/`.

Regenerate:

```bash
go run ./cmd/optdocgen
```

## Meta section fields

| key | name | type | required | unit | max_length | items_file | category | deprecated | example | description |
| ---: | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| 0 | main_region_offset | int |  | bytes | 0 |  |  | false |  | Offset of the main region, relative to the NDEF payload start. If not specified, the main region immediately follows the meta section. |
| 1 | main_region_size | int |  | bytes | 0 |  |  | false |  | Allocation size of the main region. If not specified, the region spans till the next region or payload end. |
| 2 | aux_region_offset | int |  | bytes | 0 |  |  | false |  | Offset of the auxiliary region, relative to the NDEF payload start. Omitting this field means that the auxiliary region is not present. |
| 3 | aux_region_size | int |  | bytes | 0 |  |  | false |  | Allocation size of the auxiliary region. If not specified, the region (if present) spans till the next region or payload end. |

## Main section fields

| key | name | type | required | unit | max_length | items_file | category | deprecated | example | description |
| ---: | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| 0 | instance_uuid | uuid |  |  | 0 |  |  | false |  | Unique identifier of the package instance. If not specified, can be deduced from `brand_uuid` + NFC tag UID. See _UUID_ section for more details. |
| 1 | package_uuid | uuid |  |  | 0 |  |  | false |  | Universally unique identifier of the package (product) If not specified, can be deduced from `brand_uuid` + `gtin`. See _UUID_ section for more details. |
| 2 | material_uuid | uuid |  |  | 0 |  |  | false |  | Universally unique identifier of the material. If not specified, can be deduced from `brand_uuid` + `material_name`. See _UUID_ section for more details. |
| 3 | brand_uuid | uuid |  |  | 0 |  |  | false |  | Universally unique identifier of the brand If not specified, can be deduced from the `brand_name` string. See _UUID_ section for more details. |
| 4 | gtin | number | recommended |  | 0 |  |  | false |  | Global Trade Item Number. |
| 5 | brand_specific_instance_id | string |  |  | 16 |  |  | false |  | Brand-specific identifier of the package instance. Not much use cases at this moment, possibly just for URL deduction |
| 6 | brand_specific_package_id | string |  |  | 16 |  |  | false |  | Brand-specific identifier of the package (product ID). Not much use cases at this moment, possibly just for URL deduction |
| 7 | brand_specific_material_id | string |  |  | 16 |  |  | false |  | Together with brand uniquely identifies each material. Not much use cases at this moment, possibly just for URL deduction. |
| 8 | material_class | enum | required |  | 0 | material_class_enum.yaml |  | false | FFF |  |
| 9 | material_type | enum | recommended |  | 0 | material_type_enum.yaml | fff | false | PC | Coarse classification of the material. Useful for determining default parameters for preheat an such that are not explicitly specified in the data. If the material does not match any of the proposed material types, can be left unspecified. |
| 10 | material_name | string | recommended |  | 31 |  |  | false | PC Blend Carbon Fiber Black | Brand-specific material display string/identifier. In the UI, brand_name + material_name should be displayed together, for example "Prusament PLA Galaxy Black". |
| 11 | brand_name | string | recommended |  | 31 |  |  | false | Prusament | Brand of the material. |
| 12 |  |  |  |  | 0 |  |  | true |  |  |
| 13 | write_protection | enum |  |  | 0 | write_protection_enum.yaml |  | false |  | Indicates whether the tag is write protected (everything except aux section, that one should be always writable). See the _Write protection_ section. |
| 14 | manufactured_date | timestamp | recommended |  | 0 |  |  | false |  |  |
| 15 | expiration_date | timestamp |  |  | 0 |  |  | false |  |  |
| 16 | nominal_netto_full_weight | number | recommended | g | 0 |  |  | false | 1000 | Nominal/advertised weight of the full package of the material, excluding the container. The actual netto weight of a specific package instance can slightly differ and is specified by `actual_netto_full_weight`. |
| 17 | actual_netto_full_weight | number | recommended | g | 0 |  |  | false | 1012 | Actual weight of the full package of the material of this specific package instance, excluding the weight of the container. Can slightly differ from `nominal_netto_full_weight`. If not present, it is assumed to match `nominal_netto_full_weight`. |
| 18 | empty_container_weight | number | recommended | g | 0 |  |  | false |  | Weight of the empty container. |
| 19 | primary_color | color_rgba | recommended |  | 0 |  |  | false | `\xff\x00\x00\x7f` | Primary color of the material in the RGB(A) format, intended for UI purposes. The alpha channel can be left out, in which case the data should have 3 bytes instead of 4 and the color will be considered fully opaque. If a material doesn't have a single primary color (for example rainbow or coextruded filaments), this field can be null. |
| 20 | secondary_color_0 | color_rgba |  |  | 0 |  |  | false |  | One of secondary colors of the material. Data format is the same as for `primary_color`. |
| 21 | secondary_color_1 | color_rgba |  |  | 0 |  |  | false |  | See `secondary_color_0`. |
| 22 | secondary_color_2 | color_rgba |  |  | 0 |  |  | false |  | See `secondary_color_0`. |
| 23 | secondary_color_3 | color_rgba |  |  | 0 |  |  | false |  | See `secondary_color_0`. |
| 24 | secondary_color_4 | color_rgba |  |  | 0 |  |  | false |  | See `secondary_color_0`. |
| 25 |  |  |  |  | 0 |  |  | true |  |  |
| 26 |  |  |  |  | 0 |  |  | true |  |  |
| 27 | transmission_distance | number |  | HueForge TD | 0 |  |  | false | 6.6 | Transmission Distance is a number representing material opacity. Value ranges from 0.1 (least transparent/most opaque) to 100 (most transparent/least opaque). See [Prusa TD values](https://help.prusa3d.com/article/hueforge-filament-transparency-values-and-hexcodes_762314) or [HueForge website](https://shop.thehueforge.com/blogs/news/what-is-hueforge). |
| 28 | tags | enum_array | recommended |  | 16 | tags_enum.yaml |  | false | glitter + dual_color | Properties of the material. Can have multiple tags at once. |
| 29 | density | number | recommended | g/cm³ (1 g/cm³ = 0.001 g/mm³ = 1000 kg/m³) | 0 |  |  | false | 1.24 | Density of the material. |
| 30 | filament_diameter | number |  | mm | 0 |  | fff | false | 2.75 | Diameter of the filament, in mm. If not present, 1.75 mm is assumed. |
| 31 | shore_hardness_a | int |  |  | 0 |  | fff | false | 95 | Hardness of the material on the Shore A hardness scale (suitable for softer materials). **Note:** There is no 1:1 mapping between A and D scales, different materials can have different values on one scale even though they are the same on the other. |
| 32 | shore_hardness_d | int |  |  | 0 |  | fff | false | 30 | Hardness of the material on the Shore D hardness scale (suitable for harder materials). **Note:** There is no 1:1 mapping between A and D scales, different materials can have different values on one scale even though they are the same on the other. |
| 33 | min_nozzle_diameter | number |  | mm | 0 |  | fff | false | 0.4 | Filaments can contain particles that would clog smaller nozzles. This field specifies minimum nozzle diameter recommended for printing this material. |
| 34 | min_print_temperature | int | recommended | °C | 0 |  | fff | false | 205 | Minimum recommended nozzle temperature for printing. Also used for loading the filament to the nozzle. |
| 35 | max_print_temperature | int | recommended | °C | 0 |  | fff | false | 225 | Maximum recommended nozzle temperature for printing. Also used for loading the filament to the nozzle. |
| 36 | preheat_temperature | int | recommended | °C | 0 |  | fff | false | 170 | Recommended nozzle temperature for preheating/load cell bed leveling. Should be large enough for the material to get soft, but not low enough for it no to drip out of the nozzle. |
| 37 | min_bed_temperature | int | recommended | °C | 0 |  | fff | false | 60 | Minimum recommended heatbed temperature. |
| 38 | max_bed_temperature | int | recommended | °C | 0 |  | fff | false | 60 | Maximum recommended heatbed temperature. |
| 39 | min_chamber_temperature | int |  | °C | 0 |  | fff | false | 10 | Minimum recommended temperature of the chamber. |
| 40 | max_chamber_temperature | int |  | °C | 0 |  | fff | false | 50 | Maximum recommended temperature of the chamber. |
| 41 | chamber_temperature | int |  | °C | 0 |  | fff | false | 20 | Ideal chamber temperature for printing. |
| 42 | container_width | int |  | mm | 0 |  | fff | false | 75 | Width of the filament spool. Can be useful to know for spool holders, dry boxes and such. |
| 43 | container_outer_diameter | int |  | mm | 0 |  | fff | false | 200 | Diameter of the spool. Can be useful to know for spool holders, dry boxes and such. |
| 44 | container_inner_diameter | int |  | mm | 0 |  | fff | false | 100 | Diameter of the inner cylinder the filament is spooled once. Equals to the minimum diameter of the filament winding. |
| 45 | container_hole_diameter | int |  | mm | 0 |  | fff | false | 52 | Diameter of the center hole of the spool. |
| 46 | viscosity_18c | number |  | mPa·s | 0 |  | sla | false |  | Viscosity of the material at 18 °C. |
| 47 | viscosity_25c | number |  | mPa·s | 0 |  | sla | false | 80 | Viscosity of the material at 25 °C. |
| 48 | viscosity_40c | number |  | mPa·s | 0 |  | sla | false |  | Viscosity of the material at 40 °C. |
| 49 | viscosity_60c | number |  | mPa·s | 0 |  | sla | false |  | Viscosity of the material at 60 °C. |
| 50 | container_volumetric_capacity | number |  | ml (cm³) | 0 |  | sla | false |  | Maximum amount of material the container can hold. |
| 51 | cure_wavelength | int |  | nm | 0 |  | sla | false | 405 | Wavelength of the light the material has been designed to be cured with. |
| 52 | material_abbreviation | string |  |  | 7 |  |  | false | PCCF | Abbreviation of the material name, for UI purposes (footers, dashboards, ...). If not present, the material inherits the abbreviation from the material type. |
| 53 | nominal_full_length | number |  | mm | 0 |  | fff | false | 350000 | Nominal/advertised filament length of the full spool. The actual length of a specific package instance can slightly differ and is specified by `actual_full_length` |
| 54 | actual_full_length | number |  | mm | 0 |  | fff | false | 351000 | Actual filament length of the full spool. Can slightly differ from `netto_full_length`. |
| 55 | country_of_origin | string |  |  | 2 |  |  | false |  | Country the [MaterialPackageInstance](terminology) was produced in, encoded as a two-letter code according to [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). |
| 56 | certifications | enum_array |  |  | 8 | material_certifications_enum.yaml |  | false | `ul_2818` | Certifications the material has. |

## Auxiliary section fields

| key | name | type | required | unit | max_length | items_file | category | deprecated | example | description |
| ---: | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| 0 | consumed_weight | number |  | g | 0 |  |  | false |  | Amount of material that was used up from the container. `remaining_weight` = `instance_netto_full_weight` - `consumed_weight` |
| 1 | workgroup | string |  |  | 8 |  |  | false |  | Workgroup identifier, used for detecting first usage of the material. See the _write protection_ section. |
| 2 | general_purpose_range_user | string |  |  | 8 |  |  | false | Prusa | Determines semantics of the fields in the general purpose key range. MUST be filled if any of the general purpose keys is used. See _Vendor-specific fields_. |
| 3 | last_stir_time | timestamp |  |  | 0 |  | sla | false |  | Timestamp when the resin was last stirred. Resins that have not been used for some time should be stirred before printing. |
