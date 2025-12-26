package manager

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
)

type Manager struct {
	servers []*Server
}

func (m *Manager) UpdateLED(ledName string, color []int) {
	for _, server := range m.servers {
		for i := range server.PINs {
			for j := range server.PINs[i].LEDs {
				if server.PINs[i].LEDs[j].Name == ledName {
					server.PINs[i].LEDs[j].Color = color
					break
				}
			}
		}
	}
}

func (m *Manager) SendUpdateToServers() {
	for _, server := range m.servers {
		for _, pin := range server.PINs {
			colors := [][]int{}
			for _, led := range pin.LEDs {
				colors = append(colors, led.Color)
			}
			req := map[string]interface{}{
				"pin":    pin.Pin,
				"colors": colors,
			}
			jsonReq, _ := json.Marshal(req)
			slog.Info("Sending update to server: ", "server", server.Adress, "pin", pin.Pin, "colors", colors, "jsonReq", string(jsonReq))
			resp, err := http.Post(server.Adress+"/led", "application/json", bytes.NewBuffer(jsonReq))
			if err != nil {
				slog.Error("Error sending update to server: ", "error", err)
				continue
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				slog.Error("Error reading response from server: ", "error", err)
				continue
			}
			slog.Info("Response from server: ", "body", string(body), "status", resp.StatusCode)
		}
	}
}

type Server struct {
	Adress string
	PINs   []PIN
}

func (s *Server) AddPINAndGenerateLEDs(pin int, leds []string, addEmptyBefore bool) {
	newPIN := PIN{
		Pin:  pin,
		LEDs: []LED{},
	}
	for _, led := range leds {
		if addEmptyBefore {
			newPIN.LEDs = append(newPIN.LEDs, LED{
				Active: false,
				Color:  []int{0, 0, 0},
				Name:   "",
			})
		}
		newPIN.LEDs = append(newPIN.LEDs, LED{
			Active: true,
			Color:  []int{0, 0, 0},
			Name:   led,
		})
		if !addEmptyBefore {
			newPIN.LEDs = append(newPIN.LEDs, LED{
				Active: false,
				Color:  []int{0, 0, 0},
				Name:   "",
			})
		}
	}
	s.PINs = append(s.PINs, newPIN)
}

type PIN struct {
	Pin  int
	LEDs []LED
}

type LED struct {
	Active bool
	Color  []int
	Name   string
}

func NewManager() *Manager {
	server1 := &Server{
		Adress: "http://192.168.1.243",
		PINs:   []PIN{},
	}
	server1.AddPINAndGenerateLEDs(2, []string{"B10", "B9", "B8", "B7", "B6"}, false)
	server1.AddPINAndGenerateLEDs(5, []string{"A10", "A9", "A8", "A7", "A6"}, false)
	manager := &Manager{
		servers: []*Server{server1},
	}
	return manager
}
