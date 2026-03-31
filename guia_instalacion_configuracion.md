# Guía de instalación y configuración

## Requisitos para la implementación

Para desplegar la solución se requiere un entorno con:

- Docker Desktop
- Docker Compose
- PowerShell
- Acceso a terminal en Windows

## Tecnologías utilizadas

La solución fue implementada con las siguientes tecnologías:

- **MongoDB 7.0** para la capa de datos
- **Node.js** y **Express** para los routers propios
- **HAProxy** para el balanceador de carga
- **Docker** y **Docker Compose** para el despliegue de la arquitectura
- **PowerShell (`.ps1`)** para la automatización de inicialización y validación

---

## 1. Construcción inicial de la arquitectura en `docker-compose.yml`

El proceso de instalación y configuración comenzó con la definición progresiva de la arquitectura dentro del archivo:

- `docker-compose.yml`

Este archivo fue el punto central del despliegue, ya que en él se incorporaron, por etapas, los distintos componentes del sistema hasta llegar a la versión final de la solución. En un primer momento no se levantó toda la arquitectura completa, sino que se trabajó por fases, comenzando por la capa de datos.

---

## 2. Primera etapa: configuración y levantamiento de la capa de datos

La primera parte implementada en `docker-compose.yml` fue la correspondiente a los shards de MongoDB. En esta etapa se definieron los nueve servicios que componen la capa de datos, organizados en tres shards lógicos, cada uno con:

- un nodo primario
- un nodo secundario
- un árbitro

La estructura inicial quedó formada por:

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

Cada uno de estos servicios fue definido con la imagen:

```yaml
image: mongo:7.0
```

y con la opción `--replSet`, que permitió indicar a qué replica set pertenecía cada nodo:

- `rs_shard1`
- `rs_shard2`
- `rs_shard3`

```yaml
services:
  shard1_primary:
    image: mongo:7.0
    container_name: shard1_primary
    hostname: shard1_primary
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27101:27017"
    volumes:
      - shard1_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard1_secondary:
    image: mongo:7.0
    container_name: shard1_secondary
    hostname: shard1_secondary
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27102:27017"
    volumes:
      - shard1_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard1_arbiter:
    image: mongo:7.0
    container_name: shard1_arbiter
    hostname: shard1_arbiter
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27103:27017"
    volumes:
      - shard1_arbiter_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_primary:
    image: mongo:7.0
    container_name: shard2_primary
    hostname: shard2_primary
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27201:27017"
    volumes:
      - shard2_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_secondary:
    image: mongo:7.0
    container_name: shard2_secondary
    hostname: shard2_secondary
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27202:27017"
    volumes:
      - shard2_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_arbiter:
    image: mongo:7.0
    container_name: shard2_arbiter
    hostname: shard2_arbiter
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27203:27017"
    volumes:
      - shard2_arbiter_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_primary:
    image: mongo:7.0
    container_name: shard3_primary
    hostname: shard3_primary
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27301:27017"
    volumes:
      - shard3_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_secondary:
    image: mongo:7.0
    container_name: shard3_secondary
    hostname: shard3_secondary
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27302:27017"
    volumes:
      - shard3_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_arbiter:
    image: mongo:7.0
    container_name: shard3_arbiter
    hostname: shard3_arbiter
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27303:27017"
    volumes:
      - shard3_arbiter_data:/data/db
    networks:
      - mongo_sharded_net
```

> 
---

## 3. Red y volúmenes definidos para la capa de datos

Dentro de esta primera configuración también se definieron dos elementos fundamentales: la red compartida y los volúmenes.

### 3.1 Red compartida

En `docker-compose.yml` se configuró la red:

```yaml
networks:
  mongo_sharded_net:
    driver: bridge
```

Esta red fue necesaria para que todos los contenedores pudieran comunicarse entre sí utilizando sus nombres de servicio. Gracias a esta red, los nodos MongoDB pudieron integrarse correctamente en los replica sets y, posteriormente, los routers y el balanceador pudieron comunicarse con el resto de la arquitectura.

### 3.2 Volúmenes

También se definieron volúmenes independientes para los nodos MongoDB:

```yaml
volumes:
  shard1_primary_data:
  shard1_secondary_data:
  shard1_arbiter_data:
  shard2_primary_data:
  shard2_secondary_data:
  shard2_arbiter_data:
  shard3_primary_data:
  shard3_secondary_data:
  shard3_arbiter_data:
```

Estos volúmenes se configuraron para dar persistencia a los datos almacenados por cada contenedor MongoDB.

```yaml
volumes:
  shard1_primary_data:
  shard1_secondary_data:
  shard1_arbiter_data:
  shard2_primary_data:
  shard2_secondary_data:
  shard2_arbiter_data:
  shard3_primary_data:
  shard3_secondary_data:
  shard3_arbiter_data:

networks:
  mongo_sharded_net:
    driver: bridge
```

> 

---

## 4. Levantamiento inicial de los shards

Una vez definida esta primera parte del `docker-compose.yml`, se procedió al levantamiento de los contenedores de la capa de datos con Docker Compose.

```powershell
docker compose up -d
```

Con este comando se levantaron inicialmente los nueve contenedores MongoDB correspondientes a los tres shards.

Para verificar que los servicios hubieran iniciado correctamente, se utilizó:

```powershell
docker ps
```

En esta fase, el objetivo principal no era todavía tener toda la arquitectura final operativa, sino comprobar que los nodos de la base de datos estuvieran disponibles para proceder con la siguiente etapa: la inicialización de los replica sets.

---

## 5. Inicialización de los replica sets

Después de levantar los nodos MongoDB, la arquitectura aún no estaba completa a nivel funcional, porque los shards necesitaban ser inicializados formalmente como replica sets.

Para ello se utilizó la carpeta:

- `scripts/`

como mecanismo de apoyo para la configuración de la capa de datos.

Los scripts de automatización se implementaron en **PowerShell (`.ps1`)** porque el entorno de trabajo utilizado para el proyecto fue Windows. Esto permitió ejecutar los procesos de configuración directamente desde la terminal utilizada por el equipo.

### 5.1 Script auxiliar de espera

Dentro de:

- `scripts/helpers/`

se encuentra el archivo:

- `wait-for-mongo.ps1`

Este script se utilizó para esperar a que cada nodo MongoDB estuviera realmente disponible antes de ejecutar la configuración de los replica sets.

```powershell
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
```

### 5.2 Archivos de inicialización por shard

Dentro de:

- `scripts/init/`

se encuentran los archivos:

- `shard1-init.js`
- `shard2-init.js`
- `shard3-init.js`

Cada uno de estos archivos define la configuración inicial del replica set correspondiente, estableciendo los miembros del shard y sus roles internos.

#### `shard1-init.js`

```javascript
rs.initiate({
  _id: "rs_shard1",
  members: [
    { _id: 0, host: "shard1_primary:27017", priority: 2 },
    { _id: 1, host: "shard1_secondary:27017", priority: 1 },
    { _id: 2, host: "shard1_arbiter:27017", arbiterOnly: true }
  ]
})
```

#### `shard2-init.js`

```javascript
rs.initiate({
  _id: "rs_shard2",
  members: [
    { _id: 0, host: "shard2_primary:27017", priority: 2 },
    { _id: 1, host: "shard2_secondary:27017", priority: 1 },
    { _id: 2, host: "shard2_arbiter:27017", arbiterOnly: true }
  ]
})
```

#### `shard3-init.js`

```javascript
rs.initiate({
  _id: "rs_shard3",
  members: [
    { _id: 0, host: "shard3_primary:27017", priority: 2 },
    { _id: 1, host: "shard3_secondary:27017", priority: 1 },
    { _id: 2, host: "shard3_arbiter:27017", arbiterOnly: true }
  ]
})
```

### 5.3 Script principal de inicialización

La inicialización completa de los tres replica sets se ejecutó mediante:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init-replica-sets.ps1
```

El parámetro `-ExecutionPolicy Bypass` se utilizó para permitir la ejecución puntual del script en el entorno Windows.

El contenido del script principal fue el siguiente:

```powershell
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
```

Con este paso, la capa de datos dejó de estar formada solo por contenedores MongoDB aislados y pasó a quedar configurada como tres replica sets funcionales.

> 

---

## 6. Validación del funcionamiento de los shards

Después de inicializar los replica sets, se realizó la validación de su estado para comprobar que cada shard hubiera quedado correctamente conformado.

Para esto se utilizó:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-replica-sets.ps1
```

El contenido del script fue:

```powershell
Write-Host "Validando rs_shard1..."
docker exec shard1_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"

Write-Host ""
Write-Host "Validando rs_shard2..."
docker exec shard2_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"

Write-Host ""
Write-Host "Validando rs_shard3..."
docker exec shard3_primary mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' -> ' + m.stateStr))"
```

Este script permitió verificar, para cada shard, la existencia de:

- un nodo `PRIMARY`
- un nodo `SECONDARY`
- un nodo `ARBITER`

Esta fase fue importante porque antes de continuar con el resto de la arquitectura era necesario comprobar que la lógica interna de los shards estuviera funcionando correctamente.

> 

---

## 7. Segunda etapa: incorporación de los routers al `docker-compose.yml`

Una vez validada la capa de datos, se procedió a incorporar al archivo `docker-compose.yml` los dos routers propios de la solución:

- `router1`
- `router2`

Cada uno fue definido con una construcción basada en su carpeta correspondiente:

```yaml
router1:
  build:
    context: ./routers/router1
```

```yaml
router2:
  build:
    context: ./routers/router2
```

y en la configuración completa quedaron registrados así:

```yaml
router1:
  build:
    context: ./routers/router1
  container_name: router1
  hostname: router1
  ports:
    - "3001:3000"
  networks:
    - mongo_sharded_net

router2:
  build:
    context: ./routers/router2
  container_name: router2
  hostname: router2
  ports:
    - "3002:3000"
  networks:
    - mongo_sharded_net
```

Esto permitió que los routers pudieran comunicarse con los shards ya existentes dentro de la misma red de Docker.

### 7.1 Estructura interna de los routers

Cada router quedó organizado con la siguiente estructura base:

- `Dockerfile`
- `package.json`
- `src/`

#### `Dockerfile`

El `Dockerfile` define cómo se construye la imagen del router.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
```

#### `package.json`

El archivo `package.json` define la configuración básica del servicio Node.js.

**Router1**
```json
{
  "name": "router1",
  "version": "1.0.0",
  "description": "Router de shardeo basado en cliente_id % 3",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mongodb": "^6.15.0"
  }
}
```

**Router2**
```json
{
  "name": "router2",
  "version": "1.0.0",
  "description": "Router de shardeo basado en cliente_id % 3",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mongodb": "^6.15.0"
  }
}
```

#### `src/`

La carpeta `src/` contiene la implementación principal del router. Dentro de ella se organizaron los siguientes archivos:

- `app.js`
- `config/shards.js`
- `routes/pedidos.js`
- `services/shardRouter.js`

##### `src/app.js`
Archivo principal de arranque del router. Levanta el servicio y habilita el funcionamiento del servicio dentro del contenedor.

##### `src/config/shards.js`
Centraliza la configuración de los shards y registra la información que el router necesita para identificar a qué replica set debe conectarse.

##### `src/routes/pedidos.js`
Define las rutas del servicio asociadas al manejo de pedidos. Aquí se establecen las rutas para inserción, consulta y validación básica de disponibilidad.

##### `src/services/shardRouter.js`
Contiene la lógica central del mecanismo de shardeo. Toma el valor de `cliente_id`, aplica la función determinística `cliente_id % 3`, traduce el resultado en un shard lógico y resuelve a qué replica set debe enviarse la operación.

### 7.2 Levantamiento de los routers

Una vez agregados al `docker-compose.yml`, los routers se levantaron con los siguientes comandos.

Para `router1`:

```powershell
docker compose up -d --build router1
```

Para `router2`:

```powershell
docker compose up -d --build router2
```

>

---

## 8. Validación de los routers

Después del levantamiento de cada router, se realizó una validación básica de disponibilidad utilizando el endpoint de salud expuesto por cada servicio.

Para `router1`:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3001/health
```

Para `router2`:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3002/health
```

Con estas pruebas se verificó que ambos routers hubieran quedado levantados correctamente y que estuvieran listos para recibir solicitudes de inserción y consulta.

---

## 9. Tercera etapa: incorporación del balanceador al `docker-compose.yml`

Una vez que la capa de datos y la capa de enrutamiento se encontraban operativas, se procedió a agregar al `docker-compose.yml` el último componente de la arquitectura:

- `load_balancer`

Este servicio fue definido con:

```yaml
load_balancer:
  build:
    context: ./load-balancer
```

y en la configuración completa quedó así:

```yaml
load_balancer:
  build:
    context: ./load-balancer
  container_name: load_balancer
  hostname: load_balancer
  depends_on:
    - router1
    - router2
  restart: unless-stopped
  ports:
    - "8080:8080"
  networks:
    - mongo_sharded_net
```

El hecho de agregarlo al final responde al orden real de construcción de la solución: primero debía existir la base de datos distribuida, después los routers que implementaban la lógica de shardeo y, solo al final, el componente encargado de balancear solicitudes entre ellos.

---

## 10. Configuración del balanceador

El balanceador fue implementado en la carpeta:

- `load-balancer/`

y contiene dos archivos principales:

- `Dockerfile`
- `haproxy.cfg`

### `Dockerfile`

```dockerfile
FROM haproxy:2.9-alpine
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
```

### `haproxy.cfg`

```cfg
global
    log stdout format raw local0

defaults
    log global
    mode http
    option httplog
    timeout connect 5s
    timeout client 30s
    timeout server 30s

resolvers docker
    nameserver dns 127.0.0.11:53
    hold valid 10s

frontend http_front
    bind *:8080
    default_backend routers_backend

backend routers_backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    default-server resolvers docker init-addr last,libc,none resolve-prefer ipv4 check

    server router1 router1:3000
    server router2 router2:3000
```

Este archivo contiene la configuración que permite:

- escuchar en el puerto `8080`
- balancear entre `router1` y `router2`
- realizar health checks
- y mantener continuidad del servicio si uno de los routers falla

### Levantamiento del balanceador

Una vez agregado al `docker-compose.yml`, el balanceador se levantó con:

```powershell
docker compose up -d --build load_balancer
```

Posteriormente, se validó su disponibilidad con:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/health
```

Con esta prueba se verificó que el balanceador ya podía recibir solicitudes y distribuirlas entre los dos routers.

> 

---

## 11. Versión final del `docker-compose.yml`

Después de completar todas las etapas anteriores, el archivo `docker-compose.yml` quedó conformado por:

- los nueve nodos MongoDB
- los dos routers
- el balanceador
- los volúmenes de persistencia
- y la red compartida

Es decir, el archivo final integró toda la arquitectura distribuida en un único punto de despliegue, pero su construcción real fue progresiva: primero la capa de datos, luego los routers y finalmente el balanceador.

```yaml
services:
  shard1_primary:
    image: mongo:7.0
    container_name: shard1_primary
    hostname: shard1_primary
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27101:27017"
    volumes:
      - shard1_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard1_secondary:
    image: mongo:7.0
    container_name: shard1_secondary
    hostname: shard1_secondary
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27102:27017"
    volumes:
      - shard1_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard1_arbiter:
    image: mongo:7.0
    container_name: shard1_arbiter
    hostname: shard1_arbiter
    command: ["mongod", "--replSet", "rs_shard1", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27103:27017"
    volumes:
      - shard1_arbiter_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_primary:
    image: mongo:7.0
    container_name: shard2_primary
    hostname: shard2_primary
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27201:27017"
    volumes:
      - shard2_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_secondary:
    image: mongo:7.0
    container_name: shard2_secondary
    hostname: shard2_secondary
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27202:27017"
    volumes:
      - shard2_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard2_arbiter:
    image: mongo:7.0
    container_name: shard2_arbiter
    hostname: shard2_arbiter
    command: ["mongod", "--replSet", "rs_shard2", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27203:27017"
    volumes:
      - shard2_arbiter_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_primary:
    image: mongo:7.0
    container_name: shard3_primary
    hostname: shard3_primary
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27301:27017"
    volumes:
      - shard3_primary_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_secondary:
    image: mongo:7.0
    container_name: shard3_secondary
    hostname: shard3_secondary
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27302:27017"
    volumes:
      - shard3_secondary_data:/data/db
    networks:
      - mongo_sharded_net

  shard3_arbiter:
    image: mongo:7.0
    container_name: shard3_arbiter
    hostname: shard3_arbiter
    command: ["mongod", "--replSet", "rs_shard3", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27303:27017"
    volumes:
      - shard3_arbiter_data:/data/db
    networks:
      - mongo_sharded_net

  router1:
    build:
      context: ./routers/router1
    container_name: router1
    hostname: router1
    ports:
      - "3001:3000"
    networks:
      - mongo_sharded_net

  router2:
    build:
      context: ./routers/router2
    container_name: router2
    hostname: router2
    ports:
      - "3002:3000"
    networks:
      - mongo_sharded_net

  load_balancer:
    build:
      context: ./load-balancer
    container_name: load_balancer
    hostname: load_balancer
    depends_on:
      - router1
      - router2
    restart: unless-stopped
    ports:
      - "8080:8080"
    networks:
      - mongo_sharded_net

volumes:
  shard1_primary_data:
  shard1_secondary_data:
  shard1_arbiter_data:
  shard2_primary_data:
  shard2_secondary_data:
  shard2_arbiter_data:
  shard3_primary_data:
  shard3_secondary_data:
  shard3_arbiter_data:

networks:
  mongo_sharded_net:
    driver: bridge
```

---

## 12. Secuencia real de instalación y configuración

El proceso técnico completo seguido en la implementación fue el siguiente:

1. Definir en `docker-compose.yml` la capa de datos con los nueve nodos MongoDB.  
2. Configurar la red `mongo_sharded_net` y los volúmenes de persistencia.  
3. Levantar los contenedores MongoDB con `docker compose up -d`.  
4. Inicializar los replica sets con `init-replica-sets.ps1`.  
5. Validar el estado de los shards con `check-replica-sets.ps1`.  
6. Agregar `router1` al `docker-compose.yml`, construirlo y levantarlo.  
7. Validar el funcionamiento de `router1`.  
8. Agregar `router2` al `docker-compose.yml`, construirlo y levantarlo.  
9. Validar el funcionamiento de `router2`.  
10. Agregar `load_balancer` al `docker-compose.yml`.  
11. Construir y levantar el balanceador.  
12. Verificar el acceso final por `http://localhost:8080/health`.

Este orden fue el que se siguió porque la arquitectura debía ir quedando operativa por capas: primero los shards, luego los routers que los usan y, finalmente, el balanceador que distribuye las solicitudes entre los routers.
