# Read the file
$content = Get-Content -Path "index.html" -Raw

# Remove the block between "<!-- Old Charts -->" markers and the footer
$pattern = '(<!-- Old Charts -->.*?</div>\s*)+'
$content = $content -replace $pattern, ''

# Also remove the orphaned closing tags
$content = $content -replace '(</div>\s*){3}\s*(<p class="footer")', '<p class="footer'

# Write back
Set-Content -Path "index.html" -Value $content -NoNewline
Write-Host "Fixed!"
