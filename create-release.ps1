# GitHub Release Creation Script
# This script helps create a GitHub release for v1.1.0

$repo = "meertseker/logistic-comp-order-tracking-system"
$tag = "v1.1.0"
$releaseNotes = Get-Content "RELEASE_NOTES_v1.1.0.md" -Raw

Write-Host "To create the release, you have two options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Use GitHub Web Interface (Recommended)" -ForegroundColor Green
Write-Host "1. Go to: https://github.com/$repo/releases/new" -ForegroundColor Cyan
Write-Host "2. Select tag: $tag (or create new tag: $tag)" -ForegroundColor Cyan
Write-Host "3. Release title: Release $tag - UI Enhancements & Figma Integration" -ForegroundColor Cyan
Write-Host "4. Copy the contents of RELEASE_NOTES_v1.1.0.md into the description" -ForegroundColor Cyan
Write-Host "5. Click 'Publish release'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 2: Use GitHub CLI (if installed)" -ForegroundColor Green
Write-Host "gh release create $tag --title 'Release $tag - UI Enhancements & Figma Integration' --notes-file RELEASE_NOTES_v1.1.0.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Release notes are saved in: RELEASE_NOTES_v1.1.0.md" -ForegroundColor Yellow

