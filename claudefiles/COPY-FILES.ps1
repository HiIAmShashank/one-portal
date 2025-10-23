# OnePortal - File Copy Script for Windows
# Copies all improvement files from claudefiles to the correct locations

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

# Source and destination paths
$SOURCE_BASE = "D:\Code\github\one-portal\claudefiles"
$DEST_BASE = "D:\Code\github\one-portal"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  OnePortal - Automated File Copy Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be copied" -ForegroundColor Yellow
    Write-Host ""
}

# Check if we're in the right directory
if (-not (Test-Path "$DEST_BASE\package.json")) {
    Write-Host "❌ Error: Could not find package.json in $DEST_BASE" -ForegroundColor Red
    Write-Host "Please ensure you're running this from the correct location." -ForegroundColor Red
    exit 1
}

# Function to copy file
function Copy-ProjectFile {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )
    
    $sourcePath = Join-Path $SOURCE_BASE $Source
    $destPath = Join-Path $DEST_BASE $Destination
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "⚠️  Source not found: $Source" -ForegroundColor Yellow
        return $false
    }
    
    # Create destination directory if needed
    $destDir = Split-Path -Parent $destPath
    if ($destDir -and -not (Test-Path $destDir)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Write-Host "📁 Created directory: $destDir" -ForegroundColor Gray
    }
    
    # Backup existing file
    if ((Test-Path $destPath) -and -not $Force -and -not $DryRun) {
        $backupPath = "$destPath.backup"
        Copy-Item $destPath $backupPath -Force
        Write-Host "   💾 Backed up existing file" -ForegroundColor Gray
    }
    
    # Copy file
    if (-not $DryRun) {
        Copy-Item $sourcePath $destPath -Force
    }
    
    Write-Host "✅ $Description" -ForegroundColor Green
    Write-Host "   → $Destination" -ForegroundColor Gray
    return $true
}

# Function to delete file
function Remove-ProjectFile {
    param(
        [string]$Path,
        [string]$Description
    )
    
    $fullPath = Join-Path $DEST_BASE $Path
    
    if (Test-Path $fullPath) {
        if (-not $DryRun) {
            Remove-Item $fullPath -Force
        }
        Write-Host "🗑️  Deleted: $Description" -ForegroundColor Yellow
        Write-Host "   → $Path" -ForegroundColor Gray
    } else {
        Write-Host "ℹ️  Already deleted: $Description" -ForegroundColor Gray
    }
}

Write-Host "Step 1: Root Configuration Files" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile ".gitignore" ".gitignore" "Updated .gitignore"
Copy-ProjectFile "package.json" "package.json" "Updated package.json"
Copy-ProjectFile "turbo.json" "turbo.json" "Updated turbo.json"
Copy-ProjectFile "staticwebapp.config.json" "staticwebapp.config.json" "Updated SWA config"
Copy-ProjectFile "vitest.config.ts" "vitest.config.ts" "Vitest configuration"
Write-Host ""

Write-Host "Step 2: Shell Application Files" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "apps-shell\vite.config.ts" "apps\shell\vite.config.ts" "Shell vite.config.ts"
Copy-ProjectFile "apps-shell\tsconfig.json" "apps\shell\tsconfig.json" "Shell tsconfig.json"
Write-Host ""

Write-Host "Step 3: Config Package (NEW)" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "packages-config\package.json" "packages\config\package.json" "Config package.json"
Copy-ProjectFile "packages-config\src\index.ts" "packages\config\src\index.ts" "Config index.ts"
Copy-ProjectFile "packages-config\src\env.ts" "packages\config\src\env.ts" "Config env.ts"
Copy-ProjectFile "packages-config\tsconfig.json" "packages\config\tsconfig.json" "Config tsconfig.json"
Copy-ProjectFile "packages-config\eslint.config.js" "packages\config\eslint.config.js" "Config eslint.config.js"
Write-Host ""

Write-Host "Step 4: UI Package Component" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "packages-ui\src\components\remote-error-boundary.tsx" "packages\ui\src\components\remote-error-boundary.tsx" "Error Boundary"
Write-Host ""

Write-Host "Step 5: Test Files (NEW)" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "tests\setup.ts" "tests\setup.ts" "Vitest setup"
Copy-ProjectFile "tests\remote-error-boundary.test.tsx" "tests\remote-error-boundary.test.tsx" "Error Boundary test"
Write-Host ""

Write-Host "Step 6: Git Hooks" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "husky-pre-commit" ".husky\pre-commit" "Pre-commit hook"
Write-Host ""

Write-Host "Step 7: CI/CD" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Copy-ProjectFile "github-workflows\ci.yml" ".github\workflows\ci.yml" "CI workflow"
Write-Host ""

Write-Host "Step 8: Cleanup" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────"
Remove-ProjectFile "apps\shell\src\main.js" "Duplicate main.js"

if (-not $DryRun) {
    Get-ChildItem -Path $DEST_BASE -Filter "*.tsbuildinfo" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
    Write-Host "✅ Deleted all .tsbuildinfo files" -ForegroundColor Green
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "✅ DRY RUN COMPLETE - No files were modified" -ForegroundColor Yellow
} else {
    Write-Host "✅ All files copied successfully!" -ForegroundColor Green
}
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not $DryRun) {
    Write-Host "⚠️  IMPORTANT: Manual steps required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Update packages\ui\src\index.ts:"
    Write-Host "   Add: export { RemoteErrorBoundary, withRemoteErrorBoundary } from './components/remote-error-boundary';"
    Write-Host ""
    Write-Host "2. Update apps\shell\src\main.tsx:"
    Write-Host "   Add environment validation (see FILE-LOCATIONS.md)"
    Write-Host ""
    Write-Host "3. Update apps\shell\package.json:"
    Write-Host "   Add '@one-portal/config': 'workspace:*' to dependencies"
    Write-Host ""
    Write-Host "4. Wrap remote routes with error boundary"
    Write-Host "   (see FILE-LOCATIONS.md for details)"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review changes: git status"
    Write-Host "  2. Install dependencies: pnpm install"
    Write-Host "  3. Initialize Husky: pnpm prepare"
    Write-Host "  4. Run checks: pnpm typecheck; pnpm lint; pnpm build"
    Write-Host ""
    Write-Host "📖 See FILE-LOCATIONS.md for complete details" -ForegroundColor Cyan
}

Write-Host ""
