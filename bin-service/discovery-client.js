const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const NAMING_PROTO_PATH = __dirname + '/../protos/naming.proto';
const BIN_PROTO_PATH = __dirname + '/../protos/bin.proto';

const namingPackageDefinition = protoLoader.loadSync(NAMING_PROTO_PATH);
const namingProto = grpc.loadPackageDefinition(namingPackageDefinition).naming;

const binPackageDefinition = protoLoader.loadSync(BIN_PROTO_PATH);
const binProto = grpc.loadPackageDefinition(binPackageDefinition).bin;

// Connect to Naming Service
const namingClient = new namingProto.NamingService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Ask Naming Service where the Bin Service is
namingClient.DiscoverService({ type: 'bin' }, (err, serviceInfo) => {
  if (err) {
    console.error('Could not discover Bin Service:', err.message);
    return;
  }

  console.log('Discovered Bin Service:', serviceInfo);

  const address = `${serviceInfo.host}:${serviceInfo.port}`;

  // Connect to discovered Bin Service
  const binClient = new binProto.BinService(
    address,
    grpc.credentials.createInsecure()
  );

  binClient.GetBinStatus({ binId: 'BIN001' }, (err, response) => {
    if (err) {
      console.error('Could not get bin status:', err.message);
      return;
    }

    console.log('Bin Status from discovered service:', response);
  });
});
