# To build

protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto.cmd --ts_proto_out=./compiled_proto --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false --proto_path=./proto ./proto/cpp.proto
