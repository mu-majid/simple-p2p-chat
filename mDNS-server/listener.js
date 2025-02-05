import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { mdns } from '@libp2p/mdns'
import { ping } from '@libp2p/ping'

import { stdinToStream, streamToConsole } from './stream.js'

const prefix = 'my-prefix'

const node = await createLibp2p({
  addresses: {
    listen: ['/ip4/0.0.0.0/tcp/0']
  },
  transports: [tcp()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  peerDiscovery: [
    mdns()
  ],
  services: {
    kadDHT: kadDHT({
      clientMode: false,
      protocol: '/ipfs/lan/kad/1.0.0',
      peerInfoMapper: removePublicAddressesMapper,
      validators: {
        [prefix]: async (key, value) => {
        }
      },
      selectors: {
        [prefix]: (key, records) => {
          // take the first record
          return 0
        }
      }
    }),
    identify: identify(),
    identifyPush: identifyPush(),
    ping: ping()
  }
})

// Emitted when a peer has been found
node.addEventListener('peer:connect', (evt) => {
  const peerId = evt.detail
  console.log('Connection established to:', peerId.toString()) 
})

// Handle messages for the protocol
await node.handle('/chat/1.0.0', async ({ stream }) => {
  stdinToStream(stream)
  streamToConsole(stream)
})

node.addEventListener('peer:discovery', async (evt) => {
  const peerInfo = evt.detail
  console.log('Discovered:', peerInfo.id.toString())

  // we aren't bootstrapping to an existing network 
  // so we just dial any peers
  // that are discovered
  try {
    await node.dial(peerInfo.multiaddrs)
  } catch { 
    console.error('Listener Error While Dialing ... ')
  }
})

console.info('Listener:', node.peerId.toString())