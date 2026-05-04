const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const NAMING_PROTO_PATH = __dirname + '/../protos/naming.proto';
const BIN_PROTO_PATH = __dirname + '/../protos/bin.proto';
const SCHEDULING_PROTO_PATH = __dirname + '/../protos/scheduling.proto';

const namingProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(NAMING_PROTO_PATH)
).naming;

const binProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(BIN_PROTO_PATH)
).bin;

const schedulingProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(SCHEDULING_PROTO_PATH)
).scheduling;

const namingClient = new namingProto.NamingService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Get all services
app.get('/services', (req, res) => {
  namingClient.ListServices({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// Get bin status
app.get('/bin/:binId', (req, res) => {
  namingClient.DiscoverService({ type: 'bin' }, (err, service) => {
    if (err) return res.status(500).json({ error: err.message });

    const client = new binProto.BinService(
      `${service.host}:${service.port}`,
      grpc.credentials.createInsecure()
    );

    client.GetBinStatus({ binId: req.params.binId }, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    });
  });
});

// Create pickup
app.post('/pickup', (req, res) => {
  namingClient.DiscoverService({ type: 'scheduling' }, (err, service) => {
    if (err) return res.status(500).json({ error: err.message });

    const client = new schedulingProto.SchedulingService(
      `${service.host}:${service.port}`,
      grpc.credentials.createInsecure()
    );

    client.CreatePickup(req.body, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    });
  });
});

app.listen(3000, () => {
  console.log('GUI running at http://localhost:3000');
});
