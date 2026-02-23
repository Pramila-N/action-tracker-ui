@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\gokil\Downloads\action item tracker\action-tracker-ui"
git add client/README.md
git commit -m "Remove Lovable references from README"
git push origin main
echo Done!
