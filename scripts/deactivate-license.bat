@echo off
REM Sekersoft License Deactivation Script
REM Usage: scripts\deactivate-license.bat

setlocal

set LICENSE_PATH=%APPDATA%\Sekersoft\license.dat

echo.
echo ======================================
echo   SEKERSOFT - Lisans Iptal Araci
echo ======================================
echo.

if exist "%LICENSE_PATH%" (
    echo Lisans dosyasi bulundu:
    echo   %LICENSE_PATH%
    echo.
    
    set /p CONFIRM="Lisansi iptal etmek istediginizden emin misiniz? (E/H): "
    
    if /i "%CONFIRM%"=="E" (
        del /f "%LICENSE_PATH%" 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [92mLisans basariyla iptal edildi![0m
            echo.
            echo Not: Uygulama yeniden baslatildiginda aktivasyon ekrani gorunecektir.
            echo      Tum verileriniz korunmustur.
        ) else (
            echo.
            echo [91mHata: Lisans dosyasi silinemedi![0m
        )
    ) else (
        echo.
        echo Islem iptal edildi.
    )
) else (
    echo ! Lisans dosyasi bulunamadi.
    echo   Uygulama zaten aktivasyonsuz durumda.
)

echo.
pause
