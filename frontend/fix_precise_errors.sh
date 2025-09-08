#!/bin/bash

echo "Fixing precise TypeScript errors found by tsc..."

# Fix specific files and lines identified by TypeScript compiler

# Fix access-control/page-enhanced.tsx line 155
sed -i '155s/users?.map((user) =>/users?.map((user: any) =>/' src/app/access-control/page-enhanced.tsx

# Fix access-control/page.tsx line 207, 215, 285
sed -i '207s/users?.map(u =>/users?.map((u: any) =>/' src/app/access-control/page.tsx
sed -i '215s/users?.map(user =>/users?.map((user: any) =>/' src/app/access-control/page.tsx  
sed -i '285s/invitations?.map(inv =>/invitations?.map((inv: any) =>/' src/app/access-control/page.tsx

# Fix hr-analytics/page.tsx line 97
sed -i '97s/payroll?.reduce((sum: number, pay) =>/payroll?.reduce((sum: number, pay: any) =>/' src/app/hr-analytics/page.tsx

# Fix work-requests files
sed -i 's/\.filter(r =>/\.filter((r: any) =>/g' src/app/work-requests/page-cleaned.tsx
sed -i 's/\.filter(r =>/\.filter((r: any) =>/g' src/app/work-requests/page-schema-fixed.tsx
sed -i 's/\.filter(r =>/\.filter((r: any) =>/g' src/app/work-requests/page-with-modals.tsx

echo "Precise TypeScript errors fixed."
