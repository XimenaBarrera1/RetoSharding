# Reto de Base de Datos Distribuida con Sharding por Función Determinística

## 1. Descripción general

Este Reto implementa una arquitectura distribuida compuesta por 3 shards lógicos con replicación interna, 2 routers encargados de aplicar el mecanismo de shardeo mediante una función determinística y un balanceador que distribuye las solicitudes entre ambos routers.

La solución fue diseñada para cumplir con el requerimiento de que el mecanismo de shardeo sea implementado por los routers, garantizando que un mismo identificador siempre sea enviado al mismo shard.

---

## 2. Objetivo

Construir una infraestructura distribuida que permita:

- distribuir datos horizontalmente,
- aplicar un mecanismo de shardeo determinístico,
- replicar los datos dentro de cada shard,
- soportar caída del nodo primario en un shard,
- mantener disponibilidad del servicio ante la caída de uno de los routers.

---

## 3. Regla de particionamiento

El sistema utiliza como identificador de particionamiento el campo:

- `cliente_id`

La regla definida para el enrutamiento es:

- `cliente_id % 3 == 0` → `shard1 / rs_shard1`
- `cliente_id % 3 == 1` → `shard2 / rs_shard2`
- `cliente_id % 3 == 2` → `shard3 / rs_shard3`

Esta lógica es implementada por ambos routers del sistema.

---

## 4. Modelo de datos

El modelo de datos utilizado es el siguiente:

```json
{
  "_id": "ObjectId",
  "pedido_id": 1001,
  "cliente_id": 45,
  "producto": "Laptop",
  "cantidad": 1,
  "precio": 3500000,
  "fecha": "2026-02-20",
  "estado": "Enviado"
}
