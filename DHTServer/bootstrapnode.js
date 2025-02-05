import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { tcp } from "@libp2p/tcp";
import { createLibp2p } from "libp2p";
import { kadDHT, removePublicAddressesMapper } from "@libp2p/kad-dht";
import { identify, identifyPush } from "@libp2p/identify";
import { privateKeyFromRaw } from "@libp2p/crypto/keys";
import { bootstrapPrivateKeyRaw } from "./constants.js";

const bootstrapper = await createLibp2p({
  privateKey: privateKeyFromRaw(bootstrapPrivateKeyRaw),
  addresses: {
    // Fixed address so others can connect
    listen: ["/ip4/0.0.0.0/tcp/5002"],
  },
  transports: [tcp()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  services: {
    kadDHT: kadDHT({
      clientMode: false,
      protocol: "/ipfs/lan/kad/1.0.0",
      peerInfoMapper: removePublicAddressesMapper,
    }),
    identify: identify(),
    identifyPush: identifyPush(),
  },
});

bootstrapper.addEventListener("peer:connect", async (evt) => {
  const peerId = evt.detail;
  console.log("Connection established to:", peerId.toString());
});

bootstrapper.addEventListener("peer:discovery", async (evt) => {
  const peerInfo = evt.detail;
  console.log("Discovered:", peerInfo.id.toString());
});

console.log(
  "Bootstrap Node Started at Multiaddress:",
  bootstrapper.getMultiaddrs().map((a) => a.toString())
);
