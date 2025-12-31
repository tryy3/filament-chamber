package main

import (
	"log"
	"net/http"
	"os"

	"github.com/tryy3/filament-chamber/handlers"
)

func main() {
	// // Initialize the LED manager
	// manager := manager.NewManager()

	// // Example LED updates (keep for now, can be triggered via web later)
	// manager.UpdateLED("B10", []int{255, 0, 0})
	// manager.UpdateLED("B9", []int{255, 0, 0})
	// manager.UpdateLED("B8", []int{255, 0, 0})
	// manager.UpdateLED("B7", []int{255, 0, 0})
	// manager.UpdateLED("B6", []int{255, 0, 0})
	// manager.SendUpdateToServers()

	// Set up HTTP routes
	mux := http.NewServeMux()

	// Home page
	mux.HandleFunc("/", handlers.HomeHandler)

	// Spool management page
	mux.HandleFunc("/spool", handlers.SpoolHandler)
	// Admin/testing tools page
	mux.HandleFunc("/admin", handlers.AdminHandler)

	// API endpoints
	mux.HandleFunc("/api/demo", handlers.DemoHandler)
	mux.HandleFunc("/api/spools", handlers.SpoolsAPIHandler)
	mux.HandleFunc("/api/spools/filters", handlers.FilterMetadataHandler)

	// Static files (CSS, JS)
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start the server
	log.Printf("Starting server on http://localhost:%s", port)
	log.Printf("Press Ctrl+C to stop")

	err := http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
