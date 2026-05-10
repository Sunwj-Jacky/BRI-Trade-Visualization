$content = Get-Content -Path "e:\Sun.Jacky\大学\大二下\大数据可视化\作业三\index.html" -Raw
$lines = $content -split "`n"
$start = 1150
$count = 25
for ($i = $start; $i -lt ($start + $count); $i++) {
    Write-Host "Line $($i+1): $($lines[$i])"
}
