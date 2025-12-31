# OpenPrintTag enum reference (vendored snapshot)

This file is generated from the YAML snapshot in `docs/nfc/openprinttag-spec/`.

Regenerate:

```bash
go run ./cmd/optdocgen
```

## material_class_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | FFF |  |  |  | false | Filament |
| 1 | SLA |  |  |  | false | Resin |

## material_type_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | Polylactic Acid | PLA |  |  | false | Easy-to-print, biodegradable material. Ideal for beginners, prototypes, and models. |
| 1 | Polyethylene Terephthalate Glycol | PETG |  |  | false | Durable, strong, and temperature-resistant. Great for mechanical parts and functional prints. |
| 2 | Thermoplastic Polyurethane | TPU |  |  | false | A flexible, rubber-like material. Used for phone cases, vibration dampeners, and other soft parts. |
| 3 | Acrylonitrile Butadiene Styrene | ABS |  |  | false | Strong, durable, and heat-resistant plastic. Used for functional parts like car interiors and LEGOs. Requires a heated bed and enclosure. |
| 4 | Acrylonitrile Styrene Acrylate | ASA |  |  | false | Similar to ABS but with high UV and weather resistance, making it perfect for outdoor applications. |
| 5 | Polycarbonate | PC |  |  | false | Extremely strong, impact-resistant, and heat-resistant. Used for demanding engineering applications. |
| 6 | Polycyclohexylenedimethylene Terephthalate Glycol | PCTG |  |  | false | A tougher alternative to PETG with higher impact and chemical resistance. |
| 7 | Polypropylene | PP |  |  | false | Lightweight, chemically resistant, and flexible. Used for creating living hinges and durable containers. |
| 8 | Polyamide 6 | PA6 |  |  | false | A type of Nylon that is tough and wear-resistant but absorbs more moisture than other nylons. |
| 9 | Polyamide 11 | PA11 |  |  | false | A flexible, bio-based Nylon with low moisture absorption and good chemical resistance. |
| 10 | Polyamide 12 | PA12 |  |  | false | The most common Nylon for 3D printing. Strong, tough, with low moisture absorption. Great for functional parts. |
| 11 | Polyamide 66 | PA66 |  |  | false | A stiffer and more heat-resistant Nylon compared to PA6, used for durable mechanical parts. |
| 12 | Copolyester | CPE |  |  | false | A family of strong and dimensionally stable materials (including PETG) known for chemical resistance. |
| 13 | Thermoplastic Elastomer | TPE |  |  | false | A general class of soft, rubbery materials. Softer and more flexible than TPU. |
| 14 | High Impact Polystyrene | HIPS |  |  | false | A lightweight material often used as a dissolvable support material for ABS prints (dissolves in Limonene). |
| 15 | Polyhydroxyalkanoate | PHA |  |  | false | A biodegradable material similar to PLA but with better toughness and flexibility. |
| 16 | Polyethylene Terephthalate | PET |  |  | false | The same plastic used in water bottles. Strong and food-safe, but less common for printing than PETG. |
| 17 | Polyetherimide | PEI |  |  | false | A high-performance material (also known as Ultem) with excellent thermal and mechanical properties. |
| 18 | Polybutylene Terephthalate | PBT |  |  | false | An engineering polymer with good heat resistance and electrical insulation properties. |
| 19 | Polyvinyl Butyral | PVB |  |  | false | Easy to print and can be chemically smoothed with isopropyl alcohol for a glossy finish. |
| 20 | Polyvinyl Alcohol | PVA |  |  | false | A water-soluble filament used exclusively as a support material for complex prints. |
| 21 | Polyetherketoneketone | PEKK |  |  | false | An ultra-high-performance polymer with exceptional heat, chemical, and mechanical properties for industrial use. |
| 22 | Polyether Ether Ketone | PEEK |  |  | false | An ultra-high-performance polymer with exceptional mechanical, thermal, and chemical resistance. Used in demanding aerospace, medical, and industrial applications. |
| 23 | Butenediol Vinyl Alcohol Copolymer | BVOH |  |  | false | A water-soluble support material that often dissolves faster and is easier to print than PVA. |
| 24 | Thermoplastic Copolyester | TPC |  |  | false | A flexible, TPE-like material with good thermal and chemical resistance. |
| 25 | Polyphenylene Sulfide | PPS |  |  | false | A high-performance polymer known for its thermal stability and chemical resistance, often used in automotive and electronics. |
| 26 | Polyphenylsulfone | PPSU |  |  | false | A high-performance material with excellent heat and chemical resistance, often used in medical applications. |
| 27 | Polyvinyl Chloride | PVC |  |  | false | Strong and durable but rarely used in 3D printing due to the release of toxic fumes. |
| 28 | Polyether Block Amide | PEBA |  |  | false | A flexible and lightweight TPE known for its excellent energy return, used in sports equipment. |
| 29 | Polyvinylidene Fluoride | PVDF |  |  | false | High-performance polymer with excellent resistance to chemicals and UV light. |
| 30 | Polyphthalamide | PPA |  |  | false | A high-performance Nylon with superior strength, stiffness, and heat resistance compared to standard Nylons. |
| 31 | Polycaprolactone | PCL |  |  | false | A biodegradable polyester with a very low melting point (~60 °C), allowing it to be reshaped by hand in hot water. |
| 32 | Polyethersulfone | PES |  |  | false | A high-temperature, amorphous polymer with good chemical and hydrolytic stability. |
| 33 | Polymethyl Methacrylate | PMMA |  |  | false | A rigid, transparent material also known as acrylic. Offers good optical clarity. |
| 34 | Polyoxymethylene | POM |  |  | false | A low-friction, rigid material also known as Delrin. Excellent for gears, bearings, and moving parts. |
| 35 | Polyphenylene Ether | PPE |  |  | false | An engineering thermoplastic with good temperature resistance and dimensional stability, often used in blends. |
| 36 | Polystyrene | PS |  |  | false | A lightweight and brittle material. Not commonly used in its pure form for 3D printing. |
| 37 | Polysulfone | PSU |  |  | false | A high-temperature material with good thermal stability and chemical resistance. |
| 38 | Thermoplastic Polyimide | TPI |  |  | false | An ultra-high-performance polymer with one of the highest glass transition temperatures and excellent thermal stability. |
| 39 | Styrene-Butadiene-Styrene | SBS |  |  | false | A flexible, rubber-like material (a type of TPE) known for good durability. It is relatively easy to print for a flexible filament. |
| 40 | Olefin Block Copolymer | OBC |  |  | false | A lightweight flexible material that has good dimensional stability and is weather, UV, and chemical resistant. |

## write_protection_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | no |  |  |  | false | The tag is not write protected. |
| 1 | irreversible |  |  |  | false | The tag is irreversibly protected against writing. |
| 2 | protect_page_unlockable |  |  |  | false | The tag is write-protected using the `PROTECT PAGE` command (SLIX2-specific) and is unlockable with a password that is located somewhere on the container. |

## material_certifications_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | ul_2818 |  | UL 2818 |  | false | GREENGUARD Certification Program For Chemical Emissions For Building Materials, Finishes And Furnishings. |
| 1 | ul_94_v0 |  | UL 94 V0 |  | false | Standard for Safety of Flammability of Plastic Materials for Parts in Devices and Appliances testing. Indicates a flame-retardant material. |

## tag_categories_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | biological |  | Biological |  | false |  |
| 0 | physical |  | Physical |  | false |  |
| 0 | electrical |  | Electrical |  | false |  |
| 0 | chemical |  | Chemical |  | false |  |
| 0 | visual |  | Visual |  | false |  |
| 0 | additives_organic |  | Organic additives |  | false |  |
| 0 | additives_metal |  | Metal additives |  | false |  |
| 0 | additives_other |  | Other additives |  | false |  |
| 0 | imitation |  | Imitation |  | false |  |
| 0 | other |  | Other |  | false |  |

## tags_enum.yaml

| key | name | abbreviation | display_name | category | deprecated | description |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | filtration_recommended |  | Filtration recommended | biological | false | Releases a higher concentration of unsafe particles/fumes during printing so a HEPA and carbon filter is strongly recommended. |
| 1 | biocompatible |  | Biocompatible | biological | false | Certified biocompatibility (does not cause harmful effects when in contact with the body). |
| 2 | antibacterial |  | Antibacterial | biological | false | Has antibacterial properties. |
| 3 | air_filtering |  | Air filtering | biological | false | Has air filtering properties (absorbs/filters harmful compounds/particles from the air). |
| 4 | abrasive |  | Abrasive | physical | false | The material is abrasive and requires an abrasive-resistant nozzle. |
| 5 | foaming |  | Foaming | physical | false | The material increases its volume during extrusion. |
| 6 | self_extinguishing |  | Self-extinguishing | physical | false | The material is self-extinguishing. This does not mean that the material is not flammable, just that burning it implies more energy than it produces. Meets at least UL 94 HB. |
| 7 | paramagnetic |  | Paramagnetic | physical | false | The material has paramagnetic properties, meaning that it is (weakly) attracted to magnets. |
| 8 | radiation_shielding |  | Radiation shielding | physical | false | Has radiation shielding properties. |
| 9 | high_temperature |  | High temperature | physical | false | The material softens at higher temperatures than what is common for the material type, while keeping similar printing temperatures. Can be used for HTPLA filament while keeping the PLA material type. This does NOT indicate increase resistance to flame/burning. **Note:** If the material type would be 'HTPLA', adding this tag would mean 'high-temperature variant of a high-temperature PLA' |
| 10 | esd_safe |  | ESD safe | electrical | false | The material is static dissipative - prevents electrostatic charge buildup by allowing gradual dissipation of the charge. Useful for protecting sensitive electronic components. Sheet resistance R >= 1e5 Ω/□ && R < 1e12 Ω/□ or volumetric resistivity ρ >= 1e4 Ω⋅cm && ρ < 1e11 Ω⋅cm. The tag does NOT cover the "anti-static" materials (that have higher resistances). |
| 11 | conductive |  | Conductive | electrical | false | The material can conduct electricity. This does NOT mean that it the material is a good conductor, such as metals. Common "conductive" material have resistances in the range of kiloohms on 10 cm of filament. Sheet resistance R < 1e5 Ω/□ or volumetric resistivity ρ < 1e4 Ω⋅cm. |
| 12 | blend |  | Blend | chemical | false | The material is a blend of multiple polymers or a base polymer with significant additives that alter its properties and may require a specific print profile. |
| 13 | water_soluble |  | Water soluble | chemical | false | Can be dissolved in water. |
| 14 | ipa_soluble |  | IPA soluble | chemical | false | Can be dissolved in IPA (isopropyl alcohol). |
| 15 | limonene_soluble |  | Limonene soluble | chemical | false | Can be dissolved in limonene. |
| 16 | matte |  | Matte | visual | false | Produces matte, non-shiny surface (very low specular reflection coefficient). |
| 17 | silk |  | Silk | visual | false | Produces smooth, shiny/glossy surface (higher specular reflection coefficient). |
| 18 |  |  |  |  | true |  |
| 19 | translucent |  | Translucent | visual | false | Not fully opaque – [HueForge TD](https://shop.thehueforge.com/blogs/news/what-is-hueforge) >= `X` (exact `X` will be determined later). The material with this tag can possibly disperse light, meaning that while the light goes through it, the image is "blurred" and one does not see clearly what's on the other side. See the `transparent` tag. |
| 20 | transparent |  | Transparent | visual | false | Not fully opaque, does not disperse light. Under correct printing conditions, can be printed with a see-through glass-like transparency. |
| 21 | iridescent |  | Iridescent | visual | false | Same as mystic. Changes color based on the viewing angle. See https://en.wikipedia.org/wiki/Iridescence |
| 22 | pearlescent |  | Pearlescent | visual | false | Special case of iridescent where the reflected light is mostly white. See https://en.wikipedia.org/wiki/Iridescence#Pearlescence |
| 23 | glitter |  | Glitter | visual | false | Contains coarse glitter particles, causing a shimmering effect. Similar to iridescent/pearlescent, but the individual particles causing the effect are larger, visible with the naked eye. |
| 24 | glow_in_the_dark |  | Glow in the dark | visual | false | Glows in the dark (phosphorescent). The glow color doesn't necessarily match the base material color (`illuminescent_color_change`). The different glow color can be specified as secondary color of the material. |
| 25 | neon |  | Neon | visual | false | Neon color/glows under UV light (fluorescent). The glow color doesn't necessarily match the base material color (`illuminescent_color_change`). The different glow color can be specified as secondary color of the material. |
| 26 | illuminescent_color_change |  | Illuminescent color change | visual | false | The glow color (caused by illuminiscence) is different to the material base color. For example the material is blue, but glows green in the dark or under the UV light. The glow color can be specified as a secondary color of the material. |
| 27 | temperature_color_change |  | Temperature color change | visual | false | Changes color based on the temperature. |
| 28 | gradual_color_change |  | Gradual color change | visual | false | Transitions between colors as the filament is extruded. Does not necessary mean that the filament must go through the rainbow colors, gradual color change between two colors is enough to qualify. |
| 29 | coextruded |  | Coextruded | visual | false | Co-extruded from multiple colors. The colors are all present at any cross-section of the filament. Do not confuse with `gradual_color_change`. Does not have a primary color, number of colors can be derived from the defined secondary colors. |
| 30 | contains_carbon |  | Contains carbon | additives_other | false | Contains carbon. |
| 31 | contains_carbon_fiber |  | Contains carbon fiber | additives_other | false | Contains carbon fibers. |
| 32 | contains_carbon_nano_tubes |  | Contains carbon nano tubes | additives_other | false | Contains carbon nano tubes. |
| 33 | contains_glass |  | Contains glass | additives_other | false | Contains glass. |
| 34 | contains_glass_fiber |  | Contains glass fiber | additives_other | false | Contains glass fibers. |
| 35 | contains_kevlar |  | Contains Kevlar | additives_other | false | Contains kevlar (aramid). |
| 36 | contains_stone |  | Contains stone | additives_other | false | Contains stone. |
| 37 | contains_magnetite |  | Contains magnetite | additives_other | false | Contains magnetite. |
| 38 | contains_organic_material |  | Contains organic material | additives_organic | false | Contains organic material. |
| 39 | contains_cork |  | Contains cork | additives_organic | false | Contains cork. |
| 40 | contains_wax |  | Contains wax | additives_organic | false | Contains wax. |
| 41 | contains_wood |  | Contains wood | additives_organic | false | Contains wood. |
| 42 | contains_bamboo |  | Contains bamboo | additives_organic | false | Contains bamboo. |
| 43 | contains_pine |  | Contains pine | additives_organic | false | Contains pine. |
| 44 | contains_ceramic |  | Contains ceramic | additives_other | false | Contains ceramic. |
| 45 | contains_boron_carbide |  | Contains boron carbide | additives_other | false | Contains boron carbide (useful for radiation shielding). |
| 46 | contains_metal |  | Contains metal | additives_metal | false | Contains metal. Specific type of metal contained can be expressed by an other tag. |
| 47 | contains_bronze |  | Contains bronze | additives_metal | false | Contains bronze. |
| 48 | contains_iron |  | Contains iron | additives_metal | false | Contains iron. |
| 49 | contains_steel |  | Contains steel | additives_metal | false | Contains steel. |
| 50 | contains_silver |  | Contains silver | additives_metal | false | Contains silver (useful for antibacterial properties). |
| 51 | contains_copper |  | Contains copper | additives_metal | false | Contains copper. |
| 52 | contains_aluminium |  | Contains aluminium | additives_metal | false | Contains aluminium. |
| 53 | contains_brass |  | Contains brass | additives_metal | false | Contains brass. |
| 54 | contains_tungsten |  | Contains tungsten | additives_metal | false | Contains Tungsten (useful for radiation shielding). |
| 55 | imitates_wood |  | Imitates wood | imitation | false | Imitates wood. |
| 56 | imitates_metal |  | Imitates metal | imitation | false | Imitates metal. |
| 57 | imitates_marble |  | Imitates marble | imitation | false | Imitates marble. |
| 58 | imitates_stone |  | Imitates stone | imitation | false | Imitates stone. |
| 59 | lithophane |  | Lithophane | other | false | Specifically designed for lithophaning. |
| 60 | recycled |  | Recycled | other | false | Part of the material is recycled. |
| 61 | home_compostable |  | Home compostable | biological | false | Decomposes into natural elements in a home compost system at ambient temperatures. |
| 62 | industrially_compostable |  | Industrially compostable | biological | false | Decomposes into natural elements under specific temperature and microbial conditions in commercial composting facilities. |
| 63 | bio_based |  | Bio-based | biological | false | Predominantly made from renewable biological resources, like plants. |
| 64 | low_outgassing |  | Low outgassing | chemical | false | Releases only minimal gas (and vapor) when placed in a vacuum. |
| 65 | without_pigments |  | Without pigments | visual | false | The material is of its "natural" color, no pigments were added. |
| 66 | contains_algae |  | Contains algae | additives_organic | false | Contains algae. |
| 67 | castable |  | Castable | physical | false | The material is suitable to be used as a sacrificial pattern for investment casting. It can be cleanly removed from the mold (typically burned out or melted away), leaving minimal residue (for example ashes). This does NOT mean that the material is used for the mold or the final cast itself, only the investment pattern. |
| 68 | contains_ptfe |  | Contains PTFE | additives_other | false | Contains polytetrafluoroethylene (PTFE). |
| 69 | limited_edition |  | Limited edition | other | false | The material is a limited edition run. |
| 70 | emi_shielding |  | EMI shielding | electrical | false | The material can be effectively used for shielding against electromagnetic interference. Sheet resistance R < 1 Ω/□ or volumetric resistivity ρ < 1e-2 Ω⋅cm. |

