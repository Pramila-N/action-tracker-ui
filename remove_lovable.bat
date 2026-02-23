@echo off
cd /d "c:\Users\gokil\Downloads\action item tracker\action-tracker-ui"
REM First, let's check the current status
echo Current git log:
git log --oneline -5

REM Use filter-branch with a batch-safe command
for /f "tokens=*" %%i in ('git log --format=%%H -n 1 2976cd7~1') do set PARENT=%%i

REM Create a temporary file with the new message
echo Builds role-based frontend UI > temp_msg.txt
echo. >> temp_msg.txt
echo Implemented a full frontend with Admin/Faculty/Student dashboards, auth flow, and responsive layout. Added: role-based routing, UI components (cards, tables, charts, badges, timers), mock data, time tracking, and login/register with hero image. Updated design system (colors, gradients, shadows), created KPICard, StatusBadge, PriorityBadge, and dashboard pages for all roles. Integrated hero background on login and updated app routes. >> temp_msg.txt

REM Try to amend using git - requires checking out the commit first
REM This is complex, so let's use a simpler approach with git filter-branch
