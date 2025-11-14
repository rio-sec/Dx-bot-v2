import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member (mute for a duration)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Duration in minutes (max 40320 = 28 days)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      return interaction.editReply({ content: 'User not found in this server.' });
    }

    if (!member.moderatable) {
      return interaction.editReply({ content: 'I cannot timeout this user. They may have higher permissions than me.' });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && !interaction.member.permissions.has('Administrator')) {
      return interaction.editReply({ content: 'You cannot timeout someone with equal or higher roles.' });
    }

    try {
      const timeoutUntil = new Date(Date.now() + duration * 60 * 1000);
      await member.timeout(timeoutUntil, reason);

      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const embed = new EmbedBuilder()
        .setTitle('Member Timed Out')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: 'Duration', value: durationText, inline: true },
          { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
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
        action: 'timeout',
        targetUser: `${targetUser.tag} (${targetUser.id})`,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        duration: duration.toString(),
        reason: reason,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await interaction.editReply({ content: `Error timing out user: ${error.message}` });
    }
  }
};

