package handlers

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/tryy3/filament-chamber/spoolman"
	"github.com/tryy3/filament-chamber/templates"
)

// HomeHandler serves the home page
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	// Only serve home page for the root path
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	// Render the index template
	component := templates.Index()
	err := component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}

// SpoolHandler serves the spool management page
func SpoolHandler(w http.ResponseWriter, r *http.Request) {
	// Render the spool template
	materials, brands := GetFilterMetadata()
	component := templates.Spool(materials, brands)
	err := component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}

// DemoHandler is an example HTMX endpoint that returns HTML
func DemoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	currentTime := time.Now().Format("15:04:05")
	html := fmt.Sprintf(`
		<div class="space-y-2">
			<p class="text-green-600 font-semibold">✓ HTMX is working!</p>
			<p class="text-gray-600">Current server time: %s</p>
			<p class="text-sm text-gray-500">This content was loaded dynamically without a page refresh.</p>
		</div>
	`, currentTime)
	fmt.Fprint(w, html)
}

var (
	chamberLocationRegex = regexp.MustCompile(`^chamber(?:\d+)_([A-Z0-9]+)$`)
)

// SpoolFilters contains filter criteria for spools
type SpoolFilters struct {
	Material string
	Brand    string
	Color    string
	SpoolID  string
}

// isEmpty checks if all filters are empty
func (f SpoolFilters) isEmpty() bool {
	return f.Material == "" && f.Brand == "" && f.Color == "" && f.SpoolID == ""
}

// parseFiltersFromRequest extracts filter parameters from the HTTP request
func parseFiltersFromRequest(r *http.Request) SpoolFilters {
	return SpoolFilters{
		Material: strings.TrimSpace(r.URL.Query().Get("material")),
		Brand:    strings.TrimSpace(r.URL.Query().Get("brand")),
		Color:    strings.TrimSpace(r.URL.Query().Get("color")),
		SpoolID:  strings.TrimSpace(r.URL.Query().Get("spool_id")),
	}
}

// matchesFilters checks if a spool matches the given filter criteria
func matchesFilters(spool spoolman.Spool, filters SpoolFilters) bool {
	// Material filter
	if filters.Material != "" {
		material := spoolman.GetFilamentMaterial(spool.Filament)
		if material != filters.Material {
			return false
		}
	}

	// Brand filter
	if filters.Brand != "" {
		brand := spoolman.GetFilamentBrand(spool.Filament)
		if brand != filters.Brand {
			return false
		}
	}

	// Color filter (case-insensitive substring match on hex color)
	if filters.Color != "" {
		colorHex := spoolman.GetFilamentColorHex(spool.Filament)
		filterColor := strings.ToLower(strings.TrimPrefix(filters.Color, "#"))
		if !strings.Contains(strings.ToLower(colorHex), filterColor) {
			return false
		}
	}

	// Spool ID filter (exact match)
	if filters.SpoolID != "" {
		spoolIDStr := fmt.Sprintf("%d", spool.Id)
		if spoolIDStr != filters.SpoolID {
			return false
		}
	}

	return true
}

// applyFilters filters spools and returns filtered list and ID map
func applyFilters(spools *[]spoolman.Spool, filters SpoolFilters) (*[]spoolman.Spool, map[int]bool) {
	filteredIDs := make(map[int]bool)

	// If no filters, return all spools and populate all IDs
	if filters.isEmpty() {
		for i := range *spools {
			filteredIDs[(*spools)[i].Id] = true
		}
		return spools, filteredIDs
	}

	// Apply filters
	filtered := []spoolman.Spool{}
	for i := range *spools {
		spool := (*spools)[i]
		if matchesFilters(spool, filters) {
			filtered = append(filtered, spool)
			filteredIDs[spool.Id] = true
		}
	}

	return &filtered, filteredIDs
}

// getUniqueMaterials extracts unique materials from spools
func getUniqueMaterials(spools *[]spoolman.Spool) []string {
	materialSet := make(map[string]bool)
	materials := []string{}

	for i := range *spools {
		material := spoolman.GetFilamentMaterial((*spools)[i].Filament)
		if material != "" && material != "Unknown" && !materialSet[material] {
			materialSet[material] = true
			materials = append(materials, material)
		}
	}

	return materials
}

// getUniqueBrands extracts unique brands from spools
func getUniqueBrands(spools *[]spoolman.Spool) []string {
	brandSet := make(map[string]bool)
	brands := []string{}

	for i := range *spools {
		brand := spoolman.GetFilamentBrand((*spools)[i].Filament)
		if brand != "" && brand != "Unknown Brand" && !brandSet[brand] {
			brandSet[brand] = true
			brands = append(brands, brand)
		}
	}

	return brands
}

// SpoolsAPIHandler is an HTMX endpoint that returns JSON
func SpoolsAPIHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Finding spools")
	w.Header().Set("Content-Type", "application/json")

	// Parse filters from request
	filters := parseFiltersFromRequest(r)
	log.Printf("Applied filters: %+v", filters)

	// Fetch all spools
	spools, err := spoolman.FindSpools()
	if err != nil {
		log.Printf("Error finding spools: %+v", err)
		http.Error(w, "Error finding spools", http.StatusInternalServerError)
		return
	}

	// Apply filters
	filteredSpools, filteredIDs := applyFilters(spools, filters)
	log.Printf("Filtered %d spools from %d total", len(*filteredSpools), len(*spools))

	// Create a map for O(1) location lookups
	spoolsByLocation := make(map[string]*spoolman.Spool)
	for i := range *spools {
		location := spoolman.GetSpoolLocation((*spools)[i])
		if location != "" && location != "Not specified" {
			matches := chamberLocationRegex.FindStringSubmatch(location)
			if len(matches) > 1 {
				location = matches[1]
			}
			spoolsByLocation[location] = &(*spools)[i]
		}
	}

	component := templates.SpoolsResult(filteredSpools, spoolsByLocation, filteredIDs)
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}

func GetFilterMetadata() (materials []string, brands []string) {
	spools, err := spoolman.FindSpools()
	if err != nil {
		log.Printf("Error finding spools: %+v", err)
		return
	}
	materials = getUniqueMaterials(spools)
	brands = getUniqueBrands(spools)
	return materials, brands
}

// FilterMetadataHandler returns available filter options
func FilterMetadataHandler(w http.ResponseWriter, r *http.Request) {
	spools, err := spoolman.FindSpools()
	if err != nil {
		log.Printf("Error finding spools: %+v", err)
		http.Error(w, "Error finding spools", http.StatusInternalServerError)
		return
	}

	materials := getUniqueMaterials(spools)
	brands := getUniqueBrands(spools)

	component := templates.FilterOptions(materials, brands)
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
