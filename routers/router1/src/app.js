const express = require("express");
const pedidosRoutes = require("./routes/pedidos");
const { connectToShards } = require("./services/shardRouter");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/", pedidosRoutes);

async function startServer() {
  try {
    await connectToShards();
    app.listen(PORT, () => {
      console.log(`[router1] Servidor escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("[router1] Error al iniciar:", error);
    process.exit(1);
  }
}

startServer();