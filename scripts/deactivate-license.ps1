# Sekersoft License Deactivation Script
# Usage: .\scripts\deactivate-license.ps1

$licensePath = "$env:APPDATA\Sekersoft\license.dat"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  SEKERSOFT - Lisans İptal Aracı" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $licensePath) {
    Write-Host "Lisans dosyası bulundu:" -ForegroundColor Yellow
    Write-Host "  $licensePath" -ForegroundColor Gray
    Write-Host ""
    
    $confirmation = Read-Host "Lisansı iptal etmek istediğinizden emin misiniz? (E/H)"
    
    if ($confirmation -eq 'E' -or $confirmation -eq 'e') {
        try {
            Remove-Item $licensePath -Force
            Write-Host ""
            Write-Host "✓ Lisans başarıyla iptal edildi!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Not: Uygulama yeniden başlatıldığında aktivasyon ekranı görünecektir." -ForegroundColor Gray
            Write-Host "     Tüm verileriniz korunmuştur." -ForegroundColor Gray
        }
        catch {
            Write-Host ""
            Write-Host "✗ Hata: Lisans dosyası silinemedi!" -ForegroundColor Red
            Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host ""
        Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    }
}
else {
    Write-Host "! Lisans dosyası bulunamadı." -ForegroundColor Yellow
    Write-Host "  Uygulama zaten aktivasyonsuz durumda." -ForegroundColor Gray
}

Write-Host ""
