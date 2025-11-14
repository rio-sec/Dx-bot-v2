import { getGuildConfig } from '../lib/db.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const config = await getGuildConfig(newMessage.guild.id);
    if (!config?.messageLogChannel) return;

    const logChannel = newMessage.guild.channels.cache.get(config.messageLogChannel);
    if (!logChannel) return;

    try {
      const embed = {
        title: 'Message Edited',
        color: 0xffaa00,
        fields: [
          { name: 'Author', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
          { name: 'Channel', value: `${newMessage.channel}`, inline: true },
          { name: 'Message ID', value: newMessage.id, inline: true },
          { name: 'Before', value: oldMessage.content?.substring(0, 1024) || '*No content*', inline: false },
          { name: 'After', value: newMessage.content?.substring(0, 1024) || '*No content*', inline: false }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `Message ID: ${newMessage.id}` }
      };

      await logChannel.send({ embeds: [embed] });

      await logger.logError(newMessage.guild, {
        action: 'message-edit',
        messageId: newMessage.id,
        author: `${newMessage.author.tag} (${newMessage.author.id})`,
        channel: newMessage.channel.name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Message edit log error:', error);
    }
  }
};

