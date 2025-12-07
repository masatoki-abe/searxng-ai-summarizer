#!/bin/bash

# Icon sizes to generate
SIZES=(16 32 48 96 128)
SOURCE_ICON="icons/icon.svg"
DEST_DIR="icons"

# Check if rsvg-convert is installed
if ! command -v rsvg-convert &> /dev/null; then
    echo "Error: rsvg-convert is not installed."
    echo "Please install it (e.g., sudo apt install librsvg2-bin)"
    exit 1
fi

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

echo "Generating icons from $SOURCE_ICON..."

for size in "${SIZES[@]}"; do
    output_file="$DEST_DIR/icon${size}.png"
    rsvg-convert -w "$size" -h "$size" -o "$output_file" "$SOURCE_ICON"
    if [ $? -eq 0 ]; then
        echo "✅ Created $output_file (${size}x${size})"
    else
        echo "❌ Error creating $output_file"
    fi
done

echo "🎉 Generation complete!"
