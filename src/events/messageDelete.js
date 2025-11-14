import { getGuildConfig } from '../lib/db.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const config = await getGuildConfig(message.guild.id);
    if (!config?.messageLogChannel) return;

    const logChannel = message.guild.channels.cache.get(config.messageLogChannel);
    if (!logChannel) return;

    try {
      const embed = {
        title: 'Message Deleted',
        color: 0xff0000,
        fields: [
          { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'Message ID', value: message.id, inline: true },
          { name: 'Content', value: message.content?.substring(0, 1024) || '*No content*', inline: false }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `Message ID: ${message.id}` }
      };

      if (message.attachments.size > 0) {
        embed.fields.push({
          name: 'Attachments',
          value: message.attachments.map(a => a.name).join(', '),
          inline: false
        });
      }

      await logChannel.send({ embeds: [embed] });

      await logger.logError(message.guild, {
        action: 'message-delete',
        messageId: message.id,
        author: `${message.author.tag} (${message.author.id})`,
        channel: message.channel.name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Message delete log error:', error);
    }
  }
};

