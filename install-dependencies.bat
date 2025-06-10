@echo off

echo Installing server dependencies...
cd server
call npm install typescript @types/node @types/express @types/cors @types/mongoose @types/bcryptjs @types/jsonwebtoken express cors mongoose bcryptjs jsonwebtoken dotenv

echo Installing client dependencies...
cd ../client
call npm install @types/react @types/react-dom @types/node @emotion/react @emotion/styled @mui/material @mui/icons-material axios react react-dom react-router-dom react-scripts typescript web-vitals @types/web-vitals

echo Dependencies installation completed!
pause 