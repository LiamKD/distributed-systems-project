const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const FLEET_PROTO_PATH = __dirname + '/../protos/fleet.proto';
const NAMING_PROTO_PATH = __dirname + '/../protos/naming.proto';

const fleetPackageDefinition = protoLoader.loadSync(FLEET_PROTO_PATH);
const fleetProto = grpc.loadPackageDefinition(fleetPackageDefinition).fleet;

const namingPackageDefinition = protoLoader.loadSync(NAMING_PROTO_PATH);
const namingProto = grpc.loadPackageDefinition(namingPackageDefinition).naming;

// Bidirectional streaming RPC for live truck communication
function LiveTruckControl(call) {
  call.on('data', (message) => {
    console.log('Command received:', message);

    call.write({
      truckId: message.truckId,
      status: `Command received: ${message.command}`,
      location: 'Dublin City Centre'
    });
  });

  call.on('end', () => {
    call.end();
  });
}

// Registers this Fleet Service with the Naming Service
function registerWithNamingService() {
  const namingClient = new namingProto.NamingService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  namingClient.RegisterService(
    {
      id: 'fleet-service-1',
      name: 'Fleet Control Service',
      type: 'fleet',
      host: 'localhost',
      port: 50054
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

function main() {
  const server = new grpc.Server();

  server.addService(fleetProto.FleetService.service, {
    LiveTruckControl
  });

  server.bindAsync('0.0.0.0:50054', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Fleet Service running on port 50054');
    registerWithNamingService();
  });
}

main();
