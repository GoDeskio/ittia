# This script simply runs the batch file using cmd
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "create-admin-user-complete.bat" -NoNewWindow -Wait