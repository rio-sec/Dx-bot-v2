import { strings } from '../../config/strings.js';

export class Logger {
  constructor() {
    this.channels = {};
  }

  async getChannel(guild, name) {
    try {
      const { getGuildConfig } = await import('./db.js');
      const config = await getGuildConfig(guild.id);
      
      const channelMap = {
        'vc': config?.vcLogChannel,
        'dm': config?.dmLogChannel,
        'war': config?.warLogChannel,
        'join': config?.joinLogChannel,
        'error': config?.errorLogChannel,
        'command': config?.commandLogChannel,
        'message': config?.messageLogChannel,
        'mod': config?.modLogChannel
      };

      const channelId = channelMap[name];
      if (channelId) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          if (!this.channels[guild.id]) {
            this.channels[guild.id] = {};
          }
          this.channels[guild.id][name] = channel;
          return channel;
        }
      }
    } catch (error) {
      console.error('Error getting config for logger:', error);
    }

    if (this.channels[guild.id] && this.channels[guild.id][name]) {
      return this.channels[guild.id][name];
    }

    const channelName = `${name}-logs`;
    let channel = guild.channels.cache.find(
      c => c.name === channelName && c.type === 0
    );

    if (!channel) {
      try {
        channel = await guild.channels.create({
          name: channelName,
          type: 0,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: ['ViewChannel']
            }
          ]
        });
      } catch (error) {
        console.error(`Failed to create ${channelName}:`, error);
        return null;
      }
    }

    if (!this.channels[guild.id]) {
      this.channels[guild.id] = {};
    }
    this.channels[guild.id][name] = channel;
    return channel;
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  async log(guild, logType, data) {
    try {
      const channel = await this.getChannel(guild, logType);
      if (!channel) return;

      const timestamp = this.formatTimestamp();
      let message = `timestamp: ${timestamp}\n`;

      for (const [key, value] of Object.entries(data)) {
        message += `${key}: ${value}\n`;
      }

      await channel.send(message);
    } catch (error) {
      console.error(`Logging error (${logType}):`, error);
    }
  }

  async logVC(guild, data) {
    await this.log(guild, 'vc', data);
  }

  async logDM(guild, data) {
    await this.log(guild, 'dm', data);
  }

  async logWar(guild, data) {
    await this.log(guild, 'war', data);
  }

  async logJoin(guild, data) {
    await this.log(guild, 'join', data);
  }

  async logError(guild, data) {
    await this.log(guild, 'error', data);
  }

  async logCommand(guild, data) {
    await this.log(guild, 'command', data);
  }

  async logMessage(guild, data) {
    await this.log(guild, 'message', data);
  }

  async logMod(guild, data) {
    await this.log(guild, 'mod', data);
  }
}

