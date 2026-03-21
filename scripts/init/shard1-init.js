rs.initiate({
  _id: "rs_shard1",
  members: [
    { _id: 0, host: "shard1_primary:27017", priority: 2 },
    { _id: 1, host: "shard1_secondary:27017", priority: 1 },
    { _id: 2, host: "shard1_arbiter:27017", arbiterOnly: true }
  ]
})