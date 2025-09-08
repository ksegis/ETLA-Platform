#!/bin/bash

echo "Fixing syntax errors caused by duplicate type annotations..."

# Find all TypeScript files and fix duplicate type annotations
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing: $file"
    
    # Fix duplicate type annotations: (param: any: any) -> (param: any)
    sed -i 's/(param: any: any)/(param: any)/g' "$file"
    sed -i 's/(\([^)]*\): any: any)/(\1: any)/g' "$file"
    
    # Fix specific patterns that got broken
    sed -i 's/testCase: any: any/testCase: any/g' "$file"
    sed -i 's/route: any: any/route: any/g' "$file"
    sed -i 's/id: any: any/id: any/g' "$file"
    sed -i 's/p: any: any/p: any/g' "$file"
    
    # Fix any other duplicate patterns
    sed -i 's/: any: any/: any/g' "$file"
    
done

echo "Syntax errors fixed."
