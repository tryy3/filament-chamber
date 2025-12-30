# Filament Chamber Web Server

A Go-based web server with HTMX, Templ templating, and Tailwind CSS for managing filament chamber LEDs.

## Prerequisites

- Go 1.23.3 or higher
- Node.js and npm (for Tailwind CSS)
- templ CLI tool

## Setup

### 1. Install templ CLI

```bash
go install github.com/a-h/templ/cmd/templ@latest
```

### 2. Install Node dependencies

```bash
cd server
npm install
```

### 3. Download Go dependencies

```bash
go mod download
```

## Building

You can use the provided build script for convenience:

```bash
./build.sh
```

Or build manually:

### 1. Generate Templ templates

The `.templ` files need to be compiled to Go code:

```bash
templ generate
```

This will create `*_templ.go` files from your `.templ` files.

### 2. Build Tailwind CSS

Generate the CSS file from Tailwind:

```bash
npm run build:css
```

For development with auto-rebuild on file changes:

```bash
npm run watch:css
```

### 3. Build the Go application

```bash
go build -o filament-chamber
```

## Running

After building, start the server:

```bash
./filament-chamber
```

Or run directly without building:

```bash
go run .
```

The server will start on `http://localhost:8080` by default.

To use a different port, set the `PORT` environment variable:

```bash
PORT=3000 go run .
```

## Development Workflow

For the best development experience, run these commands in separate terminals:

**Terminal 1** - Watch and rebuild Tailwind CSS:

```bash
npm run watch:css
```

**Terminal 2** - Watch and regenerate Templ templates:

```bash
templ generate --watch
```

**Terminal 3** - Run the Go server (with auto-restart using a tool like `air` or manually restart after changes):

```bash
go run .
```

## Project Structure

```
server/
├── main.go                 # Main entry point and HTTP server setup
├── go.mod                  # Go dependencies
├── package.json            # Node dependencies (Tailwind)
├── tailwind.config.js      # Tailwind configuration
├── input.css               # Tailwind input file
├── handlers/               # HTTP handlers
│   └── handlers.go
├── templates/              # Templ templates
│   ├── base.templ         # Base layout with HTMX
│   └── index.templ        # Home page
├── static/                 # Static assets
│   ├── css/
│   │   └── styles.css     # Generated Tailwind CSS
│   └── js/
│       └── app.js         # Custom JavaScript
└── manager/               # LED manager (existing code)
    └── manager.go
```

## Features

- **HTMX**: Dynamic interactions without writing JavaScript
- **Templ**: Type-safe Go templating
- **Tailwind CSS**: Utility-first CSS framework
- **Standard Library Router**: Using Go's `net/http` package
- **Expandable Sidebar**: Navigation sidebar that can be expanded/collapsed
  - Auto-expands on hover
  - Click toggle button to lock expanded/collapsed state
  - Shows icons when collapsed, icons + text when expanded
  - Smooth transitions and active page highlighting

## Routes

- `GET /` - Home page
- `GET /spool` - Spool management page
- `GET /api/demo` - Example HTMX endpoint
- `GET /static/*` - Static files (CSS, JS, images)

## NFC / RFID docs (Filament inventory workflows)

- `server/docs/nfc/openprinttag.md` - OPT (OpenPrintTag) NFC payload summary (internal reference)
- `server/docs/nfc/openprinttag-field-reference.md` - OPT fields (generated tables from vendored snapshot)
- `server/docs/nfc/openprinttag-enum-reference.md` - OPT enums (generated tables from vendored snapshot)
- `server/docs/nfc/filament-chamber-records.md` - Filament-Chamber custom NDEF records (Spoolman linkage)
- `server/docs/nfc/workflows.md` - Scan/update workflows (spool → location → Spoolman update)

## Notes

- The LED manager functionality is preserved and can be integrated with web endpoints as needed
- HTMX is loaded from CDN (unpkg.com) for simplicity
- Tailwind CSS must be rebuilt when template classes change
- Templ files must be regenerated when modified
