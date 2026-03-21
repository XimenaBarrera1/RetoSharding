Write-Host "Esperando nodos Mongo..."

powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard1_primary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard1_secondary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard1_arbiter

powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard2_primary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard2_secondary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard2_arbiter

powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard3_primary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard3_secondary
powershell -ExecutionPolicy Bypass -File .\scripts\helpers\wait-for-mongo.ps1 -ContainerName shard3_arbiter

Write-Host "Inicializando rs_shard1..."
Get-Content .\scripts\init\shard1-init.js | docker exec -i shard1_primary mongosh

Write-Host "Inicializando rs_shard2..."
Get-Content .\scripts\init\shard2-init.js | docker exec -i shard2_primary mongosh

Write-Host "Inicializando rs_shard3..."
Get-Content .\scripts\init\shard3-init.js | docker exec -i shard3_primary mongosh

Write-Host "Replica sets inicializados."