## Table of contents
- [Setup](#setup)
- [Running](#running)
- [Notes](#notes)
- [Config Details](#config-details)
- [Debugging](#dbug)


## Setup

At the root level:

1. Install example dependencies
    ```console
    $ npm install
    ```
2. Open 2 (3 in DHT case) terminal windows in either `./DHTServer` or `./mDNS-Server` directory depending on the prefered discovery method.

## Running

For the mDNS server, it is pretty straightforward:

1. Run the listener in window 1, `node listener.js`
2. Run the dialer in window 2, `node dialer.js`
3. Wait until the two peers discover each other
4. Type a message in either window and hit *enter*
5. Voila!

For the DHT server, we need to init the bootstrap node first for the listener and dialer to connect to, then the dialer will try to find the listener and dial it over chat protocol.

1. Run the bootstrap in window 1, `node bootstrapnode.js`
2. Run the listener in window 2, `node listener.js`
3. Run the dialer in window 3, `node dialer.js`
4. Wait until the two peers discover each other
5. Type a message in either window and hit *enter*
6. Voila!

## Notes

Ordinarily the steps you take when connecting to a DHT are:

 1. Connect to peers we know are already in the DHT (e.g. bootstrap peers)
 2. Run a query for your own PeerId to discover peers close to you in KAD-space
 3. Dial those peers, make & respond to queries

## Config Details

```javascript
  // must be in server mode to accept records from peers
  // - normally this is auto-detected based on having public addresses but here
  // we are local-only so just enable server mode
  clientMode: false,
  // use a custom protocol to ensure our local nodes are actually doing the work
  protocol: '/ipfs/lan/kad/1.0.0',
  // remove any public addresses from peer records because we are LAN-only
  peerInfoMapper: removePublicAddressesMapper,
  // ensure we can publish/resolve records with a custom prefix
  // if validators/selectors for the key prefix are missing the records will be ignored
  validators: {
    'my-prefix': async (key, value) => {
      // do nothing, it's valid
    }
  },
  // select a record when there are multiples resolved for the same key
  selectors: {
    'my-prefix': (key, records) => {
      // take the first record
      return 0
    }
  }
```

## Debugging:

- Use the following command to debug the operations running in the background:

```console
DEBUG="libp2p:tcp,libp2p:websockets,libp2p:webtransport,libp2p:kad-dht,libp2p:dialer" node [SCRIPT_NAME_HERE].js
```