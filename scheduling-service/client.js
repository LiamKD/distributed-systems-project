const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/scheduling.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const schedulingProto = grpc.loadPackageDefinition(packageDefinition).scheduling;

const client = new schedulingProto.SchedulingService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

// Test creating a pickup
client.CreatePickup(
  {
    binId: 'BIN001',
    priority: 5
  },
  (err, response) => {
    if (err) return console.error(err);

    console.log('Created Pickup:', response);

    // Test listing all pickups
    client.ListPickups({}, (err, response) => {
      if (err) return console.error(err);

      console.log('All Pickups:', response);
    });
  }
);
