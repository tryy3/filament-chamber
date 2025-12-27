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

func FindSpools() ([]Spool, error) {
	// params := &FindSpoolSpoolGetParams{}
	rsp, err := apiClient.FindSpoolSpoolGetWithResponse(context.Background(), nil)
	if err != nil {
		return nil, err
	}
	if rsp.StatusCode() != http.StatusOK {
		log.Fatalf("Expected HTTP 200 but received %d", rsp.StatusCode())
		return nil, fmt.Errorf("expected HTTP 200 but received %d", rsp.StatusCode())
	}
	log.Printf("test: %+v", rsp.JSON200)
	return nil, nil
}
