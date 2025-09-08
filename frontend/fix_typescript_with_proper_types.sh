#!/bin/bash

echo "Fixing TypeScript errors with proper types from type index..."

# Fix ComprehensiveDashboard.tsx with proper User type
sed -i 's/employees\.reduce((acc,/employees.reduce((acc: Record<string, number>,/g' src/components/dashboard/ComprehensiveDashboard.tsx
sed -i 's/employees\.filter((e: any)/employees.filter((e: User)/g' src/components/dashboard/ComprehensiveDashboard.tsx
sed -i 's/employees\.reduce((acc: any,/employees.reduce((acc: Record<string, number>,/g' src/components/dashboard/ComprehensiveDashboard.tsx

# Add proper imports to ComprehensiveDashboard.tsx
if ! grep -q "import.*User.*from.*@/types" src/components/dashboard/ComprehensiveDashboard.tsx; then
  sed -i '1i import { User } from "@/types"' src/components/dashboard/ComprehensiveDashboard.tsx
fi

echo "TypeScript fixes applied with proper types!"
