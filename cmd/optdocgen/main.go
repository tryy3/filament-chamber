package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

type FieldDef struct {
	Key         int        `yaml:"key"`
	Name        string     `yaml:"name"`
	Type        string     `yaml:"type"`
	Unit        string     `yaml:"unit"`
	Example     any        `yaml:"example"`
	MaxLength   int        `yaml:"max_length"`
	Required    any        `yaml:"required"` // bool or "recommended"
	ItemsFile   string     `yaml:"items_file"`
	Category    string     `yaml:"category"`
	Deprecated  bool       `yaml:"deprecated"`
	Description any        `yaml:"description"` // string or []string
	Raw         *yaml.Node `yaml:"-"`
	Extra       yaml.Node  `yaml:",inline"`
}

type EnumItem struct {
	Key         int    `yaml:"key"`
	Name        string `yaml:"name"`
	Abbrev      string `yaml:"abbreviation"`
	DisplayName any    `yaml:"display_name"`
	Description any    `yaml:"description"` // string or []string
	Category    string `yaml:"category"`
	Deprecated  bool   `yaml:"deprecated"`
}

func main() {
	// This tool is intended to be run from the `server/` module directory:
	//   go run ./cmd/optdocgen
	specDir := filepath.FromSlash("docs/nfc/openprinttag-spec")
	outFields := filepath.FromSlash("docs/nfc/openprinttag-field-reference.md")
	outEnums := filepath.FromSlash("docs/nfc/openprinttag-enum-reference.md")

	meta := mustReadFields(filepath.Join(specDir, "meta_fields.yaml"))
	mainFields := mustReadFields(filepath.Join(specDir, "main_fields.yaml"))
	aux := mustReadFields(filepath.Join(specDir, "aux_fields.yaml"))

	fieldsMd := renderFieldsDoc(specDir, meta, mainFields, aux)
	mustWriteFile(outFields, fieldsMd)

	enumFiles := []string{
		"material_class_enum.yaml",
		"material_type_enum.yaml",
		"write_protection_enum.yaml",
		"material_certifications_enum.yaml",
		"tag_categories_enum.yaml",
		"tags_enum.yaml",
	}

	enumsMd := renderEnumsDoc(specDir, enumFiles)
	mustWriteFile(outEnums, enumsMd)

	fmt.Printf("Wrote %s\nWrote %s\n", outFields, outEnums)
}

func mustWriteFile(path string, data []byte) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		panic(err)
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		panic(err)
	}
}

func mustReadFields(path string) []FieldDef {
	raw, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	// Unmarshal into a node tree so we can handle “weird” entries like { deprecated: true }.
	var root yaml.Node
	if err := yaml.Unmarshal(raw, &root); err != nil {
		panic(fmt.Errorf("parse %s: %w", path, err))
	}
	if root.Kind != yaml.DocumentNode || len(root.Content) == 0 || root.Content[0].Kind != yaml.SequenceNode {
		panic(fmt.Errorf("unexpected YAML shape in %s (expected document->sequence)", path))
	}

	seq := root.Content[0]
	fields := make([]FieldDef, 0, len(seq.Content))
	for _, n := range seq.Content {
		var f FieldDef
		if err := n.Decode(&f); err != nil {
			panic(fmt.Errorf("decode %s: %w", path, err))
		}
		f.Raw = n
		fields = append(fields, f)
	}

	sort.Slice(fields, func(i, j int) bool { return fields[i].Key < fields[j].Key })
	return fields
}

func mustReadEnumItems(path string) []EnumItem {
	raw, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	var items []EnumItem
	if err := yaml.Unmarshal(raw, &items); err != nil {
		panic(fmt.Errorf("parse %s: %w", path, err))
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Key < items[j].Key })
	return items
}

func renderFieldsDoc(specDir string, meta, mainFields, aux []FieldDef) []byte {
	var b bytes.Buffer

	b.WriteString("# OpenPrintTag field reference (vendored snapshot)\n\n")
	b.WriteString("This file is generated from the YAML snapshot in `docs/nfc/openprinttag-spec/`.\n\n")
	b.WriteString("Regenerate:\n\n")
	b.WriteString("```bash\n")
	b.WriteString("go run ./cmd/optdocgen\n")
	b.WriteString("```\n\n")

	b.WriteString("## Meta section fields\n\n")
	renderFieldTable(&b, meta)

	b.WriteString("\n## Main section fields\n\n")
	renderFieldTable(&b, mainFields)

	b.WriteString("\n## Auxiliary section fields\n\n")
	renderFieldTable(&b, aux)

	return b.Bytes()
}

func renderEnumsDoc(specDir string, enumFiles []string) []byte {
	var b bytes.Buffer

	b.WriteString("# OpenPrintTag enum reference (vendored snapshot)\n\n")
	b.WriteString("This file is generated from the YAML snapshot in `docs/nfc/openprinttag-spec/`.\n\n")
	b.WriteString("Regenerate:\n\n")
	b.WriteString("```bash\n")
	b.WriteString("go run ./cmd/optdocgen\n")
	b.WriteString("```\n\n")

	for _, ef := range enumFiles {
		full := filepath.Join(specDir, ef)
		items := mustReadEnumItems(full)

		b.WriteString("## " + ef + "\n\n")
		b.WriteString("| key | name | abbreviation | display_name | category | deprecated | description |\n")
		b.WriteString("| ---: | --- | --- | --- | --- | --- | --- |\n")
		for _, it := range items {
			desc := formatDescription(it.Description)
			disp := formatDescription(it.DisplayName)
			b.WriteString(fmt.Sprintf(
				"| %d | %s | %s | %s | %s | %t | %s |\n",
				it.Key,
				mdEscape(it.Name),
				mdEscape(it.Abbrev),
				mdEscape(disp),
				mdEscape(it.Category),
				it.Deprecated,
				mdEscape(desc),
			))
		}
		b.WriteString("\n")
	}

	return b.Bytes()
}

func renderFieldTable(b *bytes.Buffer, fields []FieldDef) {
	b.WriteString("| key | name | type | required | unit | max_length | items_file | category | deprecated | example | description |\n")
	b.WriteString("| ---: | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |\n")
	for _, f := range fields {
		// Some YAML entries are just { deprecated: true } placeholders. Skip those.
		if f.Deprecated && f.Name == "" && f.Type == "" && f.Key == 0 {
			continue
		}
		req := formatRequired(f.Required)
		desc := formatDescription(f.Description)
		ex := formatExample(f.Example)
		b.WriteString(fmt.Sprintf(
			"| %d | %s | %s | %s | %s | %d | %s | %s | %t | %s | %s |\n",
			f.Key,
			mdEscape(f.Name),
			mdEscape(f.Type),
			mdEscape(req),
			mdEscape(f.Unit),
			f.MaxLength,
			mdEscape(f.ItemsFile),
			mdEscape(f.Category),
			f.Deprecated,
			mdEscape(ex),
			mdEscape(desc),
		))
	}
}

func formatRequired(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case bool:
		if t {
			return "required"
		}
		return ""
	case string:
		if strings.TrimSpace(t) == "recommended" {
			return "recommended"
		}
		return t
	default:
		return fmt.Sprintf("%v", t)
	}
}

func formatExample(v any) string {
	if v == nil {
		return ""
	}
	switch t := v.(type) {
	case string:
		return t
	case int, int64, float64, bool:
		return fmt.Sprintf("%v", t)
	default:
		// fall back to YAML-ish formatting for complex examples
		out, _ := yaml.Marshal(t)
		return strings.TrimSpace(string(out))
	}
}

func formatDescription(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case string:
		return t
	case []any:
		parts := make([]string, 0, len(t))
		for _, p := range t {
			parts = append(parts, fmt.Sprintf("%v", p))
		}
		return strings.Join(parts, " ")
	case []string:
		return strings.Join(t, " ")
	default:
		return fmt.Sprintf("%v", t)
	}
}

func mdEscape(s string) string {
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.ReplaceAll(s, "\r", " ")
	s = strings.ReplaceAll(s, "|", "\\|")
	return strings.TrimSpace(s)
}
