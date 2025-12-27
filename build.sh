#!/bin/bash

# Build script for Filament Chamber Server

echo "🔨 Building Filament Chamber Server..."

# Generate templ templates
echo "📝 Generating Templ templates..."
templ generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate templates"
    exit 1
fi

# Build Tailwind CSS
echo "🎨 Building Tailwind CSS..."
npm run build:css

if [ $? -ne 0 ]; then
    echo "❌ Failed to build CSS"
    exit 1
fi

# Build Go binary
echo "🚀 Building Go binary..."
go build -o filament-chamber

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Go binary"
    exit 1
fi

echo "✅ Build complete! Run ./filament-chamber to start the server"

