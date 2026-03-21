rs.initiate({
  _id: "rs_shard3",
  members: [
    { _id: 0, host: "shard3_primary:27017", priority: 2 },
    { _id: 1, host: "shard3_secondary:27017", priority: 1 },
    { _id: 2, host: "shard3_arbiter:27017", arbiterOnly: true }
  ]
})