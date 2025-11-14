import { getGuildConfig } from '../lib/db.js';
import { handlePrivateVCJoin, handlePrivateVCLeave } from '../lib/privateVC.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (!newState.guild) return;

    const config = await getGuildConfig(newState.guild.id);
    if (!config || !config.privateTriggerChannelId) return;

    if (newState.channel && newState.channel.id === config.privateTriggerChannelId) {
      await handlePrivateVCJoin(newState.member, newState.channel, config, logger);
    }

    if (oldState.channel && oldState.channel.id !== newState.channel?.id) {
      await handlePrivateVCLeave(oldState.channel, logger);
    }
  }
};

