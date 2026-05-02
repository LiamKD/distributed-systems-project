const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/bin.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const binProto = grpc.loadPackageDefinition(packageDefinition).bin;

// Unary RPC
function GetBinStatus(call, callback) {
  const binId = call.request.binId;

  const response = {
    binId: binId,
    fillLevel: Math.floor(Math.random() * 100),
    batteryLevel: 80,
    overflowRisk: false
  };

  callback(null, response);
}

// Server streaming RPC
function StreamAlerts(call) {
  const interval = setInterval(() => {
    call.write({
      binId: "1",
      message: "Bin nearing capacity",
      timestamp: new Date().toISOString()
    });
  }, 2000);

  call.on('cancelled', () => {
    clearInterval(interval);
  });
}

// Client streaming RPC
function UploadReadings(call, callback) {
  let count = 0;

  call.on('data', (reading) => {
    count++;
    console.log("Received reading:", reading);
  });

  call.on('end', () => {
    callback(null, {
      count: count,
      message: "Readings received successfully"
    });
  });
}

// Start server
function main() {
  const server = new grpc.Server();

  server.addService(binProto.BinService.service, {
    GetBinStatus,
    StreamAlerts,
    UploadReadings
  });

  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Bin Service running on port 50052");
  });
}

main();
