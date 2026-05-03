const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/bin.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const binProto = grpc.loadPackageDefinition(packageDefinition).bin;

const client = new binProto.BinService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// Unary RPC test
client.GetBinStatus({ binId: 'BIN001' }, (err, response) => {
  if (err) return console.error(err);
  console.log('Bin Status:', response);
});

// Server streaming RPC test
const alertStream = client.StreamAlerts({ area: 'Dublin City Centre' });

alertStream.on('data', (alert) => {
  console.log('Alert:', alert);
});

alertStream.on('error', (err) => {
  console.error('Stream error:', err.message);
});

// Stop alert stream after 6 seconds
setTimeout(() => {
  alertStream.cancel();
  console.log('Stopped alert stream');
}, 6000);

// Client streaming RPC test
const uploadStream = client.UploadReadings((err, response) => {
  if (err) return console.error(err);
  console.log('Upload Summary:', response);
});

uploadStream.write({
  binId: 'BIN001',
  fillLevel: 70,
  timestamp: new Date().toISOString()
});

uploadStream.write({
  binId: 'BIN002',
  fillLevel: 85,
  timestamp: new Date().toISOString()
});

uploadStream.write({
  binId: 'BIN003',
  fillLevel: 45,
  timestamp: new Date().toISOString()
});

uploadStream.end();
