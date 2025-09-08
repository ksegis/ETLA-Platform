#!/bin/bash

# Fix all implicit any type errors in TypeScript files
echo "Fixing TypeScript implicit any errors..."

# Find all .tsx and .ts files and fix common patterns
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing: $file"
    
    # Fix .map( patterns
    sed -i 's/\.map(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.map((\1: any) =>/g' "$file"
    
    # Fix .filter( patterns  
    sed -i 's/\.filter(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.filter((\1: any) =>/g' "$file"
    
    # Fix .reduce( patterns (first parameter)
    sed -i 's/\.reduce(\([a-zA-Z_][a-zA-Z0-9_]*\), \([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.reduce((\1: any, \2: any) =>/g' "$file"
    
    # Fix .find( patterns
    sed -i 's/\.find(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.find((\1: any) =>/g' "$file"
    
    # Fix .forEach( patterns
    sed -i 's/\.forEach(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.forEach((\1: any) =>/g' "$file"
    
    # Fix .some( patterns
    sed -i 's/\.some(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.some((\1: any) =>/g' "$file"
    
    # Fix .every( patterns
    sed -i 's/\.every(\([a-zA-Z_][a-zA-Z0-9_]*\) =>/\.every((\1: any) =>/g' "$file"
done

echo "TypeScript fixes applied to all files."
