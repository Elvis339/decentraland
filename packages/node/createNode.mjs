import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { createLibp2p as create } from 'libp2p';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { mdns } from '@libp2p/mdns';
import defaultsDeep from '@nodeutils/defaults-deep';

export async function createNode(_options) {
  const defaults = {
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0'],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      mdns({
        interval: 5000,
      }),
    ],
    pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true }),
  };

  return create(defaultsDeep(_options, defaults));
}
