## Table of contents
- [Setup](#setup)
- [Running](#running)


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