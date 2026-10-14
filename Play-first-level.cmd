@echo off
set "GALACTACIANS_ENGINE=%LOCALAPPDATA%\GalactaciansTools\Godot_v4.7.2-stable_win64.exe"
if defined GODOT_EXE set "GALACTACIANS_ENGINE=%GODOT_EXE%"
if not exist "%GALACTACIANS_ENGINE%" (
  echo Install Godot 4.7.2, then open godot\project.godot and press F5.
  echo Or set GODOT_EXE to your Godot executable path.
  pause
  exit /b 1
)
start "Galactacians" "%GALACTACIANS_ENGINE%" --path "%~dp0godot" -- --level
