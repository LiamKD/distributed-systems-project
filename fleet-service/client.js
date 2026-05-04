const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/fleet.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const fleetProto = grpc.loadPackageDefinition(packageDefinition).fleet;

const client = new fleetProto.FleetService(
  'localhost:50054',
  grpc.credentials.createInsecure()
);

const call = client.LiveTruckControl();

call.on('data', (update) => {
  console.log('Truck Update:', update);
});

call.on('end', () => {
  console.log('Fleet stream ended');
});

call.write({
  truckId: 'TRUCK001',
  command: 'start route'
});

call.write({
  truckId: 'TRUCK001',
  command: 'collect BIN001'
});

call.write({
  truckId: 'TRUCK001',
  command: 'return to depot'
});

call.end();
