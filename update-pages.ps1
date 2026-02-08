# Script to add imports to all public pages
$pages = @(
    "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\products\creator-os\page.tsx",
    "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\about\page.tsx",
    "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\contact\page.tsx",
    "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\explore\page.tsx",
    "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\guides\page.tsx"
)

foreach ($page in $pages) {
    $content = Get-Content $page -Raw
    
    # Add imports if not already present
    if ($content -notmatch "PublicHeader") {
        $content = $content -replace '(import { Card } from "@/components/ui/Card";)', '$1`nimport { PublicHeader } from "@/components/layout/PublicHeader";`nimport { PublicFooter } from "@/components/layout/PublicFooter";'
        Set-Content $page -Value $content -NoNewline
        Write-Host "Updated: $page"
    }
}

Write-Host "All pages updated with imports!"
