import { startPresenceRotation } from '../lib/presence.js';

export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    startPresenceRotation(client);
  }
};

