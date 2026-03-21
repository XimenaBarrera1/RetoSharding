Write-Host "Validando rs_shard1..."
docker exec shard1_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"

Write-Host ""
Write-Host "Validando rs_shard2..."
docker exec shard2_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"

Write-Host ""
Write-Host "Validando rs_shard3..."
docker exec shard3_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"