const express = require("express");
const router = express.Router();
const { getShardKey, getCollectionByClienteId, databases } = require("../services/shardRouter");

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    router: "router1"
  });
});

router.post("/pedidos", async (req, res) => {
  try {
    const pedido = req.body;

    if (pedido.cliente_id === undefined || pedido.cliente_id === null) {
      return res.status(400).json({
        error: "El campo cliente_id es obligatorio"
      });
    }

    const { shard, collection } = getCollectionByClienteId(pedido.cliente_id);
    const result = await collection.insertOne(pedido);

    res.status(201).json({
      message: "Pedido insertado correctamente",
      shard,
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error("[router1] Error insertando pedido:", error);
    res.status(500).json({
      error: "Error interno al insertar el pedido"
    });
  }
});

router.get("/pedidos/:cliente_id", async (req, res) => {
  try {
    const clienteId = parseInt(req.params.cliente_id, 10);

    if (Number.isNaN(clienteId)) {
      return res.status(400).json({
        error: "cliente_id debe ser numérico"
      });
    }

    const shard = getShardKey(clienteId);
    const { collection } = getCollectionByClienteId(clienteId);

    const pedidos = await collection.find({ cliente_id: clienteId }).toArray();

    res.json({
      shard,
      total: pedidos.length,
      pedidos
    });
  } catch (error) {
    console.error("[router1] Error consultando pedidos:", error);
    res.status(500).json({
      error: "Error interno al consultar pedidos"
    });
  }
});

router.get("/todos-los-pedidos", async (req, res) => {
  try {
    // 1. Verificamos si 'databases' tiene algo
    const keys = Object.keys(databases || {});
    console.log("[Router] Shards conectados detectados:", keys);

    if (keys.length === 0) {
      return res.status(500).json({ 
        error: "El router no tiene conexiones activas a los Shards",
        ayuda: "Revisa si connectToShards() se ejecutó al inicio" 
      });
    }

    
    const promesas = keys.map(async (key) => {
      try {
        
        return await databases[key].collection("pedidos").find().toArray();
      } catch (shardErr) {
        console.error(`[Router] Error leyendo de ${key}:`, shardErr.message);
        return []; 
      }
    });
    
    const resultadosPorShard = await Promise.all(promesas);
    const todosLosPedidos = resultadosPorShard.flat(); 

    res.json({
      total: todosLosPedidos.length,
      shards_consultados: keys,
      pedidos: todosLosPedidos
    });

  } catch (error) {
    console.error("[Router] Error critico:", error);
    res.status(500).json({ 
      error: "Error en Scatter-Gather", 
      detalle: error.message 
    });
  }
});

module.exports = router;