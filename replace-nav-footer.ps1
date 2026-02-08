# PowerShell script to replace navigation and footer in all remaining pages

$replacements = @{
    "about"   = @{
        "file"        = "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\about\page.tsx"
        "navStart"    = 19
        "navEnd"      = 43
        "footerStart" = 200
        "footerEnd"   = 205
    }
    "contact" = @{
        "file"        = "c:\Users\Windows-10\OneDrive\Desktop\creator os\creator-os-app\src\app\contact\page.tsx"
        "navStart"    = 39
        "navEnd"      = 63
        "footerStart" = 200
        "footerEnd"   = 205
    }
}

Write-Host "Use multi_replace_file_content tool instead for precise replacements"
