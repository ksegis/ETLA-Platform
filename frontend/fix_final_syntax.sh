#!/bin/bash

echo "Fixing final syntax errors..."

# Fix any remaining duplicate type annotations
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    # Fix patterns like (param: type: any)
    sed -i 's/: number: any/: number/g' "$file"
    sed -i 's/: string: any/: string/g' "$file"
    sed -i 's/: boolean: any/: boolean/g' "$file"
    sed -i 's/: object: any/: object/g' "$file"
    
    # Fix any remaining duplicate patterns
    sed -i 's/: any: any/: any/g' "$file"
    sed -i 's/: \([^:]*\): any/: \1/g' "$file"
done

echo "Final syntax errors fixed."
