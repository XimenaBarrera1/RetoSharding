const { MongoClient } = require("mongodb");
const shardUris = require("../config/shards");

const DB_NAME = "distribuida_db";
const COLLECTION_NAME = "pedidos";

const clients = {};
const databases = {};

async function connectToShards() {
  for (const [key, uri] of Object.entries(shardUris)) {
    const client = new MongoClient(uri);
    await client.connect();
    clients[key] = client;
    databases[key] = client.db(DB_NAME);
    console.log(`[router2] Conectado a ${key}`);
  }
}

function getShardKey(clienteId) {
  const result = clienteId % 3;

  if (result === 0) return "shard1";
  if (result === 1) return "shard2";
  return "shard3";
}

function getCollectionByClienteId(clienteId) {
  const shard = getShardKey(clienteId);
  return {
    shard,
    collection: databases[shard].collection(COLLECTION_NAME)
  };
}

module.exports = {
  connectToShards,
  getShardKey,
  getCollectionByClienteId,
  databases
};