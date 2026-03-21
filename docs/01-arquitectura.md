# Arquitectura del Sistema

## 1. Contexto

El proyecto corresponde a una base de datos distribuida que debe implementar particionamiento horizontal, replicación por shard, tolerancia a fallos y alta disponibilidad en la capa de acceso.

El requerimiento principal establece que el mecanismo de shardeo debe ser implementado por los routers del sistema mediante una función determinística.

---

## 2. Requisitos que debe cumplir la solución

La infraestructura debe cumplir con los siguientes puntos:

- 3 shards lógicos,
- replicación interna en cada shard,
- 2 routers balanceados,
- aplicación del mecanismo de shardeo desde los routers,
- uso de una función determinística de particionamiento,
- asignación estable del mismo identificador al mismo shard,
- distribución horizontal de los datos,
- continuidad del servicio ante fallos.

---

## 3. Decisión de arquitectura

La arquitectura seleccionada se compone de:

- 1 balanceador de carga,
- 2 routers propios,
- 3 shards lógicos,
- 1 replica set por shard,
- 3 nodos por replica set:
  - 1 primario,
  - 1 secundario,
  - 1 árbitro.

Esta arquitectura fue elegida porque permite que el mecanismo de particionamiento sea controlado directamente por los routers, mientras que el balanceador solo distribuye las solicitudes entre ellos sin intervenir en la lógica de shardeo.

---

## 4. Justificación de no usar `mongos`

En esta solución no se utiliza `mongos` porque el requerimiento establece que los routers son responsables de implementar el mecanismo de shardeo.

Dado que `mongos` no permite definir de forma programable una regla personalizada como:

`cliente_id % 3`

se opta por implementar routers propios que calculan la función determinística y seleccionan el shard correspondiente.

---

## 5. Justificación de no usar config servers

No se utilizan config servers porque estos forman parte del mecanismo de sharding nativo de MongoDB y su función principal es almacenar la metadata que usa `mongos` para enrutar operaciones dentro de un clúster fragmentado.

En esta arquitectura, los routers ya conocen la regla de enrutamiento:

- `cliente_id % 3 == 0` → `shard1 / rs_shard1`
- `cliente_id % 3 == 1` → `shard2 / rs_shard2`
- `cliente_id % 3 == 2` → `shard3 / rs_shard3`

Por tanto, el sistema no necesita una capa externa de metadata para decidir el destino de cada operación.

---

## 6. Función del balanceador

El balanceador de carga actúa como punto único de entrada al sistema.

Sus responsabilidades son:

- recibir las solicitudes del cliente,
- distribuir las peticiones entre `router1` y `router2`,
- detectar la caída de un router,
- seguir enviando tráfico al router disponible.

Esto permite demostrar alta disponibilidad de la capa de routers, ya que si uno de ellos falla, el balanceador continúa enviando tráfico al router disponible.

---

## 7. Función de los routers

Los routers implementan el mecanismo de shardeo.

Cada router debe:

1. recibir una operación,
2. extraer el campo `cliente_id`,
3. calcular `cliente_id % 3`,
4. determinar el shard correspondiente,
5. conectarse al replica set adecuado,
6. ejecutar la lectura o escritura.

Ambos routers deben implementar exactamente la misma lógica para garantizar consistencia en el enrutamiento.

---

## 8. Función de los shards

Cada shard almacena una partición de los datos y está compuesto por un replica set.

La función de cada replica set es:

- almacenar los datos asignados a ese shard,
- replicar los datos hacia un nodo secundario,
- permitir elección de nuevo primario en caso de fallo,
- mantener disponibilidad interna del shard.

---

## 9. Regla de particionamiento

El identificador elegido para la distribución es:

- `cliente_id`

La regla de particionamiento es:

- `cliente_id % 3 == 0` → `rs_shard1`
- `cliente_id % 3 == 1` → `rs_shard2`
- `cliente_id % 3 == 2` → `rs_shard3`

Esto garantiza que:

- el mismo cliente siempre irá al mismo shard,
- la función de asignación es determinística,
- la distribución puede demostrarse de forma explícita.

---

## 10. Ventajas de la arquitectura elegida

Esta arquitectura permite:

- cumplir con el requisito de que los routers implementen el shardeo,
- demostrar claramente la función determinística,
- separar el balanceo del enrutamiento,
- mantener replicación dentro de cada shard,
- probar fallos de primario,
- probar alta disponibilidad del router mediante balanceo y failover entre `router1` y `router2`.

---

## 11. Resumen

La solución final implementa el shardeo a nivel de router mediante una regla fija basada en `cliente_id % 3`, mientras que MongoDB se utiliza como capa de almacenamiento replicado dentro de cada shard.

De esta manera se cumple el requerimiento del enunciado y se mantiene una infraestructura distribuida, replicada y tolerante a fallos.