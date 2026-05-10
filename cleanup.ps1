$content = Get-Content -Path "index.html" -Raw -Encoding UTF8
$content = $content -replace '(<!-- Old Charts -->.*?briRankingChart -->.*?</div>\s*)+', ''
$content = $content -replace '\s*<!-- Old Charts -->\s*<div id="scatterTooltip".*?</div>\s*</div>', ''
Set-Content -Path "index.html" -Value $content -NoNewline -Encoding UTF8
Write-Host "Done"
