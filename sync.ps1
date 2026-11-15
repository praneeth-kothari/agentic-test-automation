Set-Location 'C:\Users\Dell\.praneeth\agentic-test-automation'
$ErrorActionPreference = 'Continue'
git add -A 2>$null
git commit -m "Remove temp base64 files" 2>$null
Write-Output "--- COMMIT DONE ---"
git pull origin main --allow-unrelated-histories --no-edit 2>&1
Write-Output "--- PULL DONE ---"
git push origin main 2>&1
Write-Output "--- PUSH DONE ---"
git log --oneline -5 2>&1