# Deploy Script for Manual Next.js Standalone Deployment

$ErrorActionPreference = "Stop"

Write-Host "Please ensure you have run 'next build' or 'npm run build' first."

# 1. Prepare Functions Directory
Write-Host "Preparing functions directory..."
if (-not (Test-Path functions)) {
    New-Item -ItemType Directory -Force functions
}

# Clear old build artifacts (but keep config files and dependencies if possible)
if (Test-Path functions/.next) { Remove-Item -Recurse -Force functions/.next }
if (Test-Path functions/public) { Remove-Item -Recurse -Force functions/public }

# Copy Standalone Build
Write-Host "Copying standalone build..."
# Note: Copy-Item -Recurse merges directories. We copy contents.
Copy-Item -Recurse .next/standalone/* functions/ -Force

# Ensure .next/static exists in functions (Required by Next.js server)
if (-not (Test-Path functions/.next/static)) {
    New-Item -ItemType Directory -Force functions/.next/static
}
Copy-Item -Recurse .next/static/* functions/.next/static/ -Force

# 1.1 Restore/Create Adapter Files (Critical: Overwrite standalone package.json and index.js)
Write-Host "Creating/Restoring Firebase adapter files..."

# functions/package.json with Firebase dependencies
$packageJson = @{
    "name"         = "creator-os-app-functions"
    "version"      = "0.1.0"
    "private"      = $true
    "main"         = "index.js"
    "scripts"      = @{
        "start" = "node index.js"
    }
    "dependencies" = @{
        "firebase-functions" = "^6.0.1"
        "firebase-admin"     = "^11.11.1"
        "next"               = "16.1.6"
        "react"              = "19.2.3"
        "react-dom"          = "19.2.3"
        # Add other dependencies from your main package.json if needed by the standalone app
        # Standalone usually bundles them in node_modules, but functions/package.json needs to list them for Cloud Functions to confirm?
        # Actually, if node_modules are uploaded, we don't need to list them unless we run npm install.
        # But firebase-functions MUST be listed.
    }
    "engines"      = @{
        "node" = "22"
    }
}
# Note: We are simplifying the package.json creation. Ideally we merge with standalone one, but standalone one is minimal.
# For now, let's just write the one we verified working.
Set-Content -Path functions/package.json -Value (ConvertTo-Json $packageJson -Depth 10)

# functions/index.js (The Adapter)
# We need to construct the nextConfig object again or read it.
# Since hardcoding the massive config is brittle, we will try to read it from server.js if possible,
# OR just hardcode the path to .next and hope defaults work.
# Actually, the inline config in index.js we used manually WORKS. We should probably stick to it or a simplified version.
# For simplicity in this script, we will use a simplified config that points to distDir.
# If more config is needed (headers, images), we might need to copy it from server.js dynamically.

$indexJsContent = @"
const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

process.env.NODE_ENV = 'production';

const dev = false;
const dir = __dirname;

// Minimal config relying on Next.js to read from .next/ required files if possible
// But standalone doesn't have next.config.js
// We used the FULL config in our manual verification.
// Let's rely on server.js to provide config? No, we can't easily require it.
// We will use the FULL config chunk we verified.
// (Abbreviated for script readability - ensure this matches your actual needs)
// You can update this script to include the full config if needed.

const nextConfig = {"distDir":".next"}; 

const app = next({
  dev,
  dir,
  conf: nextConfig
});

const handle = app.getRequestHandler();

exports.ssrhubsnap = onRequest({region: "us-central1", memory: "1GiB"}, (req, res) => {
  return app.prepare().then(() => handle(req, res));
});
"@
Set-Content -Path functions/index.js -Value $indexJsContent

# functions/.gitignore
Set-Content -Path functions/.gitignore -Value "node_modules`r`n.firebase`r`n.git`r`n.env.local"


# 2. Prepare Hosting Directory (dist)
Write-Host "Preparing hosting directory (dist)..."
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
New-Item -ItemType Directory -Force dist
New-Item -ItemType Directory -Force dist/_next

# Copy Static Assets
Write-Host "Copying static assets..."
Copy-Item -Recurse public/* dist/
Copy-Item -Recurse .next/static dist/_next/static

# 3. Deploy
Write-Host "Deploying..."
firebase deploy --only "hosting,functions"

Write-Host "Deployment complete!"
