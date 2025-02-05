import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify, identifyPush } from "@libp2p/identify";
import { kadDHT, removePublicAddressesMapper } from "@libp2p/kad-dht";
import { tcp } from "@libp2p/tcp";
import { createLibp2p } from "libp2p";
import { ping } from "@libp2p/ping";
import { bootstrap } from "@libp2p/bootstrap";
import bootstrappers from "./bootstrappers.js";
import { peerIdFromString } from "@libp2p/peer-id";
import { stdinToStream, streamToConsole } from "./stream.js";

const prefix = "my-prefix";

const node = await createLibp2p({
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
      clientMode: true,
      protocol: "/ipfs/lan/kad/1.0.0",
      peerInfoMapper: removePublicAddressesMapper,
      validators: {
        [prefix]: async (key, value) => {
          // do nothing, it's valid
        },
      },
      selectors: {
        [prefix]: (key, records) => {
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
      // dht must be enabled
      enabled: true,
    },
  },
});

node.addEventListener("peer:connect", async (evt) => {
  const peerId = evt.detail;
  console.log("Connection established to: ", peerId.toString());
});

node.addEventListener("peer:discovery", async (evt) => {
  const peerInfo = evt.detail;
  console.log("Discovered: ", peerInfo.id.toString());
});

const bootstrapPeerIdString =
  "12D3KooWGMYMmN1RGUYjWaSV6P3XtnBjwnosnJGNMnttfVCRnd6g";
const bootstrapPeerId = peerIdFromString(bootstrapPeerIdString);

for await (const evt of node.services.kadDHT.findPeer(bootstrapPeerId)) {
  if (evt.messageType === "FIND_NODE" && evt?.closer?.length) {
    const { closer } = evt;
    const listenerPeer = closer.find(
      (peer) => peer.id.toString() !== bootstrapPeerIdString
    );
    console.log("listener's Multiaddress:", listenerPeer.multiaddrs);
    try {
      const stream = await node.dialProtocol(listenerPeer.id, "/chat/1.0.0");
      console.log("Start Chatting 🚀");
      stdinToStream(stream);
      streamToConsole(stream);
    } catch (e) {
      console.error(
        `Dialer Error While Dialing ${listenerPeer.id.toString()} ... `,
        e
      );
    }
  }
}

console.log(
  "Dialer Available at address:",
  node.getMultiaddrs().map((a) => a.toString()),
  "\n"
);
