const express = require("express");
const router = express.Router();
const { getShardKey, getCollectionByClienteId } = require("../services/shardRouter");

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

module.exports = router;