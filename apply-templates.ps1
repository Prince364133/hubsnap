# PowerShell script to add header and footer template scripts to all HTML pages

$pages = @(
    "index.html",
    "explore.html",
    "guides.html",
    "guide.html",
    "tool.html",
    "services.html"
)

foreach ($page in $pages) {
    $filePath = "C:\Users\hp\Desktop\explore based website\$page"
    
    if (Test-Path $filePath) {
        Write-Host "Processing $page..." -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw
        
        # Check if scripts are already added
        if ($content -notmatch "js/header\.js" -and $content -notmatch "js/footer\.js") {
            # Find the closing </body> tag and add scripts before it
            $content = $content -replace '(\s*<script\s+src="js/app\.js">.*?</script>\s*</body>)', 
                "`n    <script src=`"js/header.js`"></script>`n    <script src=`"js/footer.js`"></script>`$1"
            
            # Save the file
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Added template scripts to $page" -ForegroundColor Green
        } else {
            Write-Host "○ $page already has template scripts" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ $page not found" -ForegroundColor Red
    }
}

Write-Host "`nDone! All pages updated with universal header and footer templates." -ForegroundColor Green
