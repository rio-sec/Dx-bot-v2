export class PrivateVC {
  constructor(data) {
    this.channelId = data.channelId;
    this.guildId = data.guildId;
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt || Date.now();
  }

  toJSON() {
    return {
      channelId: this.channelId,
      guildId: this.guildId,
      ownerId: this.ownerId,
      createdAt: this.createdAt
    };
  }
}

