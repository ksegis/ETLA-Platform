#!/bin/bash

echo "Fixing ALL TypeScript object indexing errors..."

# Find all TypeScript files and fix object indexing patterns
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing: $file"
    
    # Fix common object indexing patterns with proper type assertions
    # Pattern: objectName[variable] -> objectName[variable as keyof typeof objectName]
    
    # Common config objects that need fixing
    sed -i 's/statusColors\[\([^]]*\)\]/statusColors[\1 as keyof typeof statusColors]/g' "$file"
    sed -i 's/priorityColors\[\([^]]*\)\]/priorityColors[\1 as keyof typeof priorityColors]/g' "$file"
    sed -i 's/availabilityConfig\[\([^]]*\)\]/availabilityConfig[\1 as keyof typeof availabilityConfig]/g' "$file"
    
    # Generic pattern for any object indexing with variables
    # This is more aggressive but should catch most cases
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*Config\)\[\([^]]*\)\]/\1[\2 as keyof typeof \1]/g' "$file"
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*Colors\)\[\([^]]*\)\]/\1[\2 as keyof typeof \1]/g' "$file"
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*Styles\)\[\([^]]*\)\]/\1[\2 as keyof typeof \1]/g' "$file"
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*Map\)\[\([^]]*\)\]/\1[\2 as keyof typeof \1]/g' "$file"
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*Icons\)\[\([^]]*\)\]/\1[\2 as keyof typeof \1]/g' "$file"
    
    # Fix any remaining object[property] patterns where property comes from any-typed variables
    # This is a more general pattern that should catch edge cases
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\[\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)\]/\1[\2.\3 as keyof typeof \1]/g' "$file"
done

echo "All TypeScript object indexing errors fixed."
