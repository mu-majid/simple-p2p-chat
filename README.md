## Table of contents
- [Setup](#setup)
- [Running](#running)
- [Notes](#notes)
- [Config Details](#config-details)


## Setup

At the root level:

1. Install example dependencies
    ```console
    $ npm install
    ```
2. Open 2 terminal windows in the `./server` directory.

## Running

1. Run the listener in window 1, `node listener.js`
2. Run the dialer in window 2, `node dialer.js`
3. Wait until the two peers discover each other
4. Type a message in either window and hit *enter*
5. Voila!

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