import { strings } from '../../config/strings.js';

let presenceIndex = 0;

export function updatePresence(client) {
  const presence = strings.presence[presenceIndex];
  
  client.user.setPresence({
    activities: [{
      name: presence,
      type: 0
    }],
    status: 'online'
  });

  presenceIndex = (presenceIndex + 1) % strings.presence.length;
}

export function startPresenceRotation(client) {
  updatePresence(client);
  setInterval(() => {
    updatePresence(client);
  }, 30000);
}

