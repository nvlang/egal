#!/bin/bash

# Directory containing .ase files
ASE_DIR="out/ase"

# Output directory for .clr files
CLR_DIR="out/clr"

# Get the operating system name
OS_NAME=$(uname)

# Ensure output directory exists
mkdir -p "$CLR_DIR"

# Loop through all .ase files in the ASE_DIR
for ase_file in "$ASE_DIR"/*.ase; do
    # Run the clg command for each file
    clg clr --output "$CLR_DIR" "$ase_file"
    if [ "$OS_NAME" = "Darwin" ]; then
        # Add the color palettes to '~/Library/Colors' if running on macOS
        clg clr "$ase_file"
    fi
done
