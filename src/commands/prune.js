import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('prune')
    .setDescription('Delete a number of messages from a channel')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for pruning')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      let deleted = 0;
      const messages = await interaction.channel.messages.fetch({ limit: amount });

      if (targetUser) {
        const userMessages = messages.filter(m => m.author.id === targetUser.id);
        deleted = userMessages.size;
        
        if (deleted > 0) {
          await interaction.channel.bulkDelete(userMessages, true);
        }
      } else {
        deleted = messages.size;
        await interaction.channel.bulkDelete(messages, true);
      }

      const embed = new EmbedBuilder()
        .setTitle('Messages Pruned')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Deleted', value: `${deleted} message(s)`, inline: true },
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: 'Target User', value: targetUser ? `${targetUser.tag}` : 'All users', inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      const config = await getGuildConfig(interaction.guild.id);
      if (config?.modLogChannel) {
        const logChannel = interaction.guild.channels.cache.get(config.modLogChannel);
        if (logChannel) {
          await logChannel.send({ embeds: [embed] });
        }
      }

      await logger.logError(interaction.guild, {
        action: 'prune',
        deleted: deleted.toString(),
        channel: interaction.channel.name,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        targetUser: targetUser ? `${targetUser.tag} (${targetUser.id})` : 'all',
        reason: reason,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await interaction.editReply({ content: `Error pruning messages: ${error.message}` });
    }
  }
};

