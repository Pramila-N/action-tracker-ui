#!/usr/bin/env pwsh

# Exit any stuck git processes
Get-Process git -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to repo
cd "c:\Users\gokil\Downloads\action item tracker\action-tracker-ui"

# Use git filter-branch to remove X-Lovable-Edit-ID from the commit
$filter = {
    $msg = Get-Content -Raw
    $msg -replace "`nX-Lovable-Edit-ID:.*`n", "`n" -replace "X-Lovable-Edit-ID:.*`n", "" | Set-Content -PassThru
}

& git.exe filter-branch --msg-filter 'powershell -Command {$input | ForEach-Object {$_ -replace "`nX-Lovable-Edit-ID:.*", ""} | Write-Output}' 2976cd7..HEAD

# Force push to update remote
& git.exe push --force-with-lease origin main
