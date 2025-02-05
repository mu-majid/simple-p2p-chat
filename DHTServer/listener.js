import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify, identifyPush } from "@libp2p/identify";
import { kadDHT, removePublicAddressesMapper } from "@libp2p/kad-dht";
import { tcp } from "@libp2p/tcp";
import { createLibp2p } from "libp2p";
import { ping } from "@libp2p/ping";
import { bootstrap } from "@libp2p/bootstrap";
import { privateKeyFromRaw } from "@libp2p/crypto/keys";
import { stdinToStream, streamToConsole } from "./stream.js";
import bootstrappers from "./bootstrappers.js";
import { listenerPrivateKey } from "./constants.js";

const prefix = "my-prefix";
const node = await createLibp2p({
  privateKey: privateKeyFromRaw(listenerPrivateKey),
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/0"],
  },
  transports: [tcp()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  peerDiscovery: [
    bootstrap({
      // bootstrap node address
      list: bootstrappers,
    }),
  ],
  services: {
    kadDHT: kadDHT({
      clientMode: false,
      protocol: "/ipfs/lan/kad/1.0.0",
      peerInfoMapper: removePublicAddressesMapper,
      validators: {
        [prefix]: async (key, value) => {},
      },
      selectors: {
        [prefix]: (key, records) => {
          // take the first record
          return 0;
        },
      },
    }),
    identify: identify(),
    identifyPush: identifyPush(),
    ping: ping(),
  },
  config: {
    dht: {
      enabled: true,
    },
  },
});

node.addEventListener("peer:connect", async (evt) => {
  const peerId = evt.detail;
  console.log("Connection established to:", peerId.toString(), "\n");
});

node.addEventListener("peer:discovery", async (evt) => {
  const peerInfo = evt.detail;
  console.log("Discovered:", peerInfo.id.toString());
});

await node.handle("/chat/1.0.0", async ({ stream }) => {
  stdinToStream(stream);
  streamToConsole(stream);
});

for await (const evt of node.services.kadDHT.provide(node.peerId)) {
  console.log(">", evt);
}

console.log(
  "Announcing listener address:",
  node.getMultiaddrs().map((a) => a.toString()),
  "\n"
);
