@echo off
title Push BhoomiSetu to GitHub
echo ============================================================
echo   Pushing BhoomiSetu (SIH 2026) to GitHub (Shinjon-Soul0208)
echo ============================================================
echo.

cd /d "C:\Users\dassh\OneDrive\Desktop\CSE\PROJECT&FREELANCING\SIH_2026"

echo Current Directory: %CD%
echo.

echo Running: git push -u origin main
echo.
git push -u origin main

echo.
echo ============================================================
echo If asked for credentials, please sign in via browser!
echo ============================================================
pause
