@echo off
echo Compiling TypeScript...
npx tsc scripts/remove-god-role.ts --esModuleInterop --outDir ./dist/scripts

echo Running migration...
node ./dist/scripts/remove-god-role.js

echo Done! 