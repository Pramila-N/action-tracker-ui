@echo off
cd /d "c:\Users\gokil\Downloads\action item tracker\action-tracker-ui\client"
if exist package-lock.json del package-lock.json
echo Removed package-lock.json
echo.
echo Now run: bun install (or npm install)
echo to regenerate the lock file without lovable references
