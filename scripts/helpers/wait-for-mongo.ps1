param(
    [string]$ContainerName
)

while ($true) {
    docker exec $ContainerName mongosh --quiet --eval "db.adminCommand('ping').ok" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$ContainerName esta disponible."
        break
    }
    Write-Host "Esperando a que $ContainerName este disponible..."
    Start-Sleep -Seconds 2
}