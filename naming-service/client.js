const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/naming.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const namingProto = grpc.loadPackageDefinition(packageDefinition).naming;

const client = new namingProto.NamingService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.RegisterService(
  {
    id: "1",
    name: "BinService",
    type: "bin",
    host: "localhost",
    port: 50052
  },
  (err, response) => {
    if (err) return console.error(err);

    console.log("Register Response:", response);

    client.ListServices({}, (err, res) => {
      if (err) return console.error(err);

      console.log("All Services:", res);

      client.DiscoverService({ type: "bin" }, (err, res) => {
        if (err) return console.error(err);

        console.log("Discovered Service:", res);
      });
    });
  }
);
