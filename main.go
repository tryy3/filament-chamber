package main

import "github.com/tryy3/filament-chamber/manager"

func main() {
	manager := manager.NewManager()
	manager.UpdateLED("B10", []int{255, 0, 0})
	manager.UpdateLED("B9", []int{255, 0, 0})
	manager.UpdateLED("B8", []int{255, 0, 0})
	manager.UpdateLED("B7", []int{255, 0, 0})
	manager.UpdateLED("B6", []int{255, 0, 0})
	manager.SendUpdateToServers()
}
