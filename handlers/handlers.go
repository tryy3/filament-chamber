package handlers

import (
	"fmt"
	"log"
	"net/http"
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
	component := templates.Spool()
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

// SpoolsAPIHandler is an HTMX endpoint that returns JSON
func SpoolsAPIHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Finding spools")
	w.Header().Set("Content-Type", "application/json")
	spools, err := spoolman.FindSpools()
	if err != nil {
		log.Printf("Error finding spools: %+v", err)
		http.Error(w, "Error finding spools", http.StatusInternalServerError)
		return
	}
	log.Printf("%+v", spools)
	component := templates.SpoolsResult()
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
