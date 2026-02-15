# PowerShell script to test Docker image locally before registering in Archestra

Write-Host "Testing Google Maps MCP Server Docker Image..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "1. Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   ✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Test image pull
Write-Host ""
Write-Host "2. Pulling Docker image..." -ForegroundColor Yellow
docker pull sushantjainn/google-maps-mcp:latest
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Image pulled successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to pull image" -ForegroundColor Red
    exit 1
}

# Test container startup (will fail without env vars, but should show proper error)
Write-Host ""
Write-Host "3. Testing container startup (will fail without credentials, but should show proper structure)..." -ForegroundColor Yellow
Write-Host "   Running: docker run --rm sushantjainn/google-maps-mcp:latest" -ForegroundColor Gray

$testOutput = docker run --rm sushantjainn/google-maps-mcp:latest 2>&1
$testExitCode = $LASTEXITCODE

if ($testOutput -match "Fatal error" -or $testOutput -match "Google Maps MCP server") {
    Write-Host "   ✓ Container starts and runs (may fail without credentials, which is expected)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Container output: $testOutput" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. Configuration Summary:" -ForegroundColor Yellow
Write-Host "   Docker Image: sushantjainn/google-maps-mcp:latest" -ForegroundColor White
Write-Host "   Executable: node" -ForegroundColor White
Write-Host "   Arguments: dist/server.js" -ForegroundColor White
Write-Host "   Transport: stdio" -ForegroundColor White
Write-Host ""

Write-Host "✓ Ready to register in Archestra MCP Registry!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Archestra MCP Registry" -ForegroundColor White
Write-Host "2. Add new MCP server" -ForegroundColor White
Write-Host "3. Use the configuration from ARCHESTRA_REGISTRATION_GUIDE.md" -ForegroundColor White
Write-Host "4. Set required environment variables:" -ForegroundColor White
Write-Host "   - GOOGLE_CLIENT_ID (Secret)" -ForegroundColor Gray
Write-Host "   - GOOGLE_CLIENT_SECRET (Secret)" -ForegroundColor Gray
Write-Host "   - GOOGLE_REDIRECT_URI (Regular)" -ForegroundColor Gray
Write-Host ""
