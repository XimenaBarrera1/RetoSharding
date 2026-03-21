# Topología del Sistema

## 1. Vista general


La topología del sistema está compuesta por una capa de acceso, una capa de enrutamiento y una capa de datos.

### Capa de acceso
- `load_balancer`

### Capa de enrutamiento
- `router1`
- `router2`

### Capa de datos
- `rs_shard1` (`shard1_primary`, `shard1_secondary`, `shard1_arbiter`)
- `rs_shard2` (`shard2_primary`, `shard2_secondary`, `shard2_arbiter`)
- `rs_shard3` (`shard3_primary`, `shard3_secondary`, `shard3_arbiter`)

---

## 2. Contenedores definidos

### Balanceador
- `load_balancer`

### Routers
- `router1`
- `router2`

### Shard 1
- `shard1_primary`
- `shard1_secondary`
- `shard1_arbiter`

### Shard 2
- `shard2_primary`
- `shard2_secondary`
- `shard2_arbiter`

### Shard 3
- `shard3_primary`
- `shard3_secondary`
- `shard3_arbiter`

---

## 3. Replica sets

Cada shard funciona como un replica set independiente.

### Replica set del Shard 1
- nombre: `rs_shard1`

### Replica set del Shard 2
- nombre: `rs_shard2`

### Replica set del Shard 3
- nombre: `rs_shard3`

---

## 4. Puertos de trabajo

### Balanceador
- `load_balancer` → `8080`

### Routers
- `router1` → `3001`
- `router2` → `3002`

### Shard 1
- `shard1_primary` → `27101`
- `shard1_secondary` → `27102`
- `shard1_arbiter` → `27103`

### Shard 2
- `shard2_primary` → `27201`
- `shard2_secondary` → `27202`
- `shard2_arbiter` → `27203`

### Shard 3
- `shard3_primary` → `27301`
- `shard3_secondary` → `27302`
- `shard3_arbiter` → `27303`

---

## 5. Red de contenedores

Todos los servicios se conectan a una única red Docker:

- `mongo_sharded_net`

Esto permite comunicación por nombre de servicio entre contenedores.

---

## 6. Regla de enrutamiento

El sistema utiliza la siguiente regla:

- `cliente_id % 3 == 0` → `shard1 / rs_shard1`
- `cliente_id % 3 == 1` → `shard2 / rs_shard2`
- `cliente_id % 3 == 2` → `shard3 / rs_shard3`

Esta lógica se implementa de forma idéntica en `router1` y `router2`.

---

## 7. Flujo de escritura

1. el cliente envía una solicitud al balanceador,
2. el balanceador redirige la petición a `router1` o `router2`,
3. el router extrae `cliente_id`,
4. calcula `cliente_id % 3`,
5. identifica el shard destino,
6. envía la operación al replica set correspondiente, y el driver de MongoDB resuelve el nodo primario activo para realizar la escritura,
7. MongoDB replica la información al nodo secundario.

---

## 8. Flujo de lectura

1. el cliente realiza una consulta,
2. el balanceador envía la petición a uno de los routers,
3. el router toma `cliente_id`,
4. aplica la regla `cliente_id % 3`,
5. identifica el shard correspondiente,
6. consulta el replica set correcto,
7. devuelve la información al cliente.

---

## 9. Alta disponibilidad del router

La alta disponibilidad del router se implementa mediante:

- un balanceador de carga,
- dos routers con la misma lógica,
- verificación del estado de los routers.

Si uno de los routers falla, el balanceador continúa enviando tráfico al router disponible.##

---

## 10. Tolerancia a fallos en la capa de datos

Cada shard cuenta con:

- 1 primario,
- 1 secundario,
- 1 árbitro.

Si el nodo primario falla, el replica set debe elegir un nuevo primario, manteniendo operativo el shard.

---

## 11. Resumen de la topología

La infraestructura completa queda formada por:

- 1 balanceador,
- 2 routers,
- 3 replica sets,
- 9 nodos MongoDB en total.

Total general:

- 12 contenedores.