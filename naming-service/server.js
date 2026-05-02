const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/naming.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const namingProto = grpc.loadPackageDefinition(packageDefinition).naming;

let services = [];

function RegisterService(call, callback) {
  const service = call.request;

  services.push(service);

  console.log('Registered service:', service);

  callback(null, {
    success: true,
    message: `${service.name} registered successfully`
  });
}

function UnregisterService(call, callback) {
  const serviceId = call.request.id;

  services = services.filter(service => service.id !== serviceId);

  callback(null, {
    success: true,
    message: `Service ${serviceId} unregistered successfully`
  });
}

function DiscoverService(call, callback) {
  const requestedType = call.request.type;

  const service = services.find(service => service.type === requestedType);

  if (!service) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `No service found for type: ${requestedType}`
    });
  }

  callback(null, service);
}

function ListServices(call, callback) {
  callback(null, {
    services: services
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(namingProto.NamingService.service, {
    RegisterService,
    UnregisterService,
    DiscoverService,
    ListServices
  });

  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log('Naming Service running on port 50051');
      server.start();
    }
  );
}

main();
