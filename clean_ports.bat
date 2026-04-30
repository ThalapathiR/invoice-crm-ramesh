@echo off
echo Cleaning ports 8000 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process %%a on port 8000
    taskkill /F /PID %%a /T
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing process %%a on port 5173
    taskkill /F /PID %%a /T
)

taskkill /F /IM node.exe /T 2>nul
echo Done.
