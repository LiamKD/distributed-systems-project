const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const SCHEDULING_PROTO_PATH = __dirname + '/../protos/scheduling.proto';
const NAMING_PROTO_PATH = __dirname + '/../protos/naming.proto';

const schedulingPackageDefinition = protoLoader.loadSync(SCHEDULING_PROTO_PATH);
const schedulingProto = grpc.loadPackageDefinition(schedulingPackageDefinition).scheduling;

const namingPackageDefinition = protoLoader.loadSync(NAMING_PROTO_PATH);
const namingProto = grpc.loadPackageDefinition(namingPackageDefinition).naming;

let pickups = [];

// Creates a pickup request for a bin
function CreatePickup(call, callback) {
  const request = call.request;

  const pickup = {
    pickupId: `PICKUP-${pickups.length + 1}`,
    binId: request.binId,
    priority: request.priority,
    scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: 'scheduled'
  };

  pickups.push(pickup);

  callback(null, pickup);
}

// Returns all pickup requests
function ListPickups(call, callback) {
  callback(null, {
    pickups: pickups
  });
}

// Registers this service with the Naming Service
function registerWithNamingService() {
  const namingClient = new namingProto.NamingService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  namingClient.RegisterService(
    {
      id: 'scheduling-service-1',
      name: 'Collection Scheduling Service',
      type: 'scheduling',
      host: 'localhost',
      port: 50053
    },
    (err, response) => {
      if (err) {
        console.error('Failed to register with Naming Service:', err.message);
        return;
      }

      console.log('Naming Service registration:', response.message);
    }
  );
}

// Starts the Scheduling Service
function main() {
  const server = new grpc.Server();

  server.addService(schedulingProto.SchedulingService.service, {
    CreatePickup,
    ListPickups
  });

  server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Scheduling Service running on port 50053');
    registerWithNamingService();
  });
}

main();
