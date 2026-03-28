const express = require("express");
const pedidosRoutes = require("./routes/pedidos");
const { connectToShards } = require("./services/shardRouter");

const app = express();
const PORT = 3000;

function logEvent(type, data = {}) {
  const timestamp = new Date().toISOString();
  const details = Object.entries(data)
    .map(([key, value]) => {
      try {
        return `${key}=${typeof value === "object" ? JSON.stringify(value) : value}`;
      } catch {
        return `${key}=[unserializable]`;
      }
    })
    .join(" ");

  console.log(`[${timestamp}] [router1] ${type} ${details}`);
}

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  logEvent("REQ_IN", {
    method: req.method,
    path: req.originalUrl,
    body: req.body || {},
  });

  res.on("finish", () => {
    logEvent("REQ_OUT", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - start,
    });
  });

  next();
});

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