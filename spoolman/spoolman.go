package spoolman

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

var apiClient *ClientWithResponses

func init() {
	hc := &http.Client{
		Timeout: 10 * time.Second,
	}
	c, err := NewClientWithResponses("https://spoolman.tryy3.dev/api/v1", WithHTTPClient(hc))
	if err != nil {
		log.Fatal(err)
	}
	apiClient = c
}

func FindSpools() (*[]Spool, error) {
	// params := &FindSpoolSpoolGetParams{}
	rsp, err := apiClient.FindSpoolSpoolGetWithResponse(context.Background(), nil)
	if err != nil {
		return nil, err
	}
	if rsp.StatusCode() != http.StatusOK {
		log.Printf("Expected HTTP 200 but received %d", rsp.StatusCode())
		return nil, fmt.Errorf("expected HTTP 200 but received %d", rsp.StatusCode())
	}
	return rsp.JSON200, nil
}

func GetFilamentName(f Filament) string {
	if f.Name == nil {
		return "Unknown Filament"
	}

	name, err := f.Name.AsFilamentName0()
	if err != nil {
		log.Printf("Error getting filament name: %+v", err)
		return "Unknown Filament"
	}

	return name
}

func GetFilamentBrand(f Filament) string {
	if f.Vendor == nil {
		return "Unknown Brand"
	}

	vendor, err := f.Vendor.AsVendor()
	if err != nil {
		log.Printf("Error getting filament brand: %+v", err)
		return "Unknown Brand"
	}
	return vendor.Name
}
func GetFilamentMaterial(f Filament) string {
	if f.Material == nil {
		return "Unknown"
	}

	material, err := f.Material.AsFilamentMaterial0()
	if err != nil {
		log.Printf("Error getting filament material: %+v", err)
		return "Unknown"
	}
	return material
}

func GetFilamentColorHex(f Filament) string {
	if f.ColorHex == nil {
		return "CCCCCC" // Default gray color
	}

	colorHex, err := f.ColorHex.AsFilamentColorHex0()
	if err != nil {
		log.Printf("Error getting filament color: %+v", err)
		return "CCCCCC" // Default gray color
	}

	// Remove # if present, we'll add it in the template
	if len(colorHex) > 0 && colorHex[0] == '#' {
		return colorHex[1:]
	}
	return colorHex
}

func GetSpoolLocation(s Spool) string {
	if s.Location == nil {
		return "Not specified"
	}

	location, err := s.Location.AsSpoolLocation0()
	if err != nil {
		log.Printf("Error getting spool location: %+v", err)
		return "Not specified"
	}
	return location
}

func GetSpoolRemainingWeight(s Spool) float32 {
	if s.RemainingWeight == nil {
		return 0
	}

	weight, err := s.RemainingWeight.AsSpoolRemainingWeight0()
	if err != nil {
		log.Printf("Error getting remaining weight: %+v", err)
		return 0
	}
	return weight
}

func GetSpoolInitialWeight(s Spool) float32 {
	if s.InitialWeight == nil {
		return 0
	}

	weight, err := s.InitialWeight.AsSpoolInitialWeight0()
	if err != nil {
		log.Printf("Error getting initial weight: %+v", err)
		return 0
	}
	return weight
}

func GetSpoolLastUsed(s Spool) string {
	if s.LastUsed == nil {
		return "Never"
	}

	lastUsed, err := s.LastUsed.AsSpoolLastUsed0()
	if err != nil {
		log.Printf("Error getting last used: %+v", err)
		return "Never"
	}

	// Parse the datetime and format it nicely
	t, err := time.Parse(time.RFC3339, lastUsed)
	if err != nil {
		log.Printf("Error parsing last used date: %+v", err)
		return lastUsed // Return raw string if parsing fails
	}

	return t.Format("Jan 02, 2006")
}
