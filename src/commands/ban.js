import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('delete_days')
        .setDescription('Delete messages from the last N days (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (member) {
      if (!member.bannable) {
        return interaction.editReply({ content: 'I cannot ban this user. They may have higher permissions than me.' });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position && !interaction.member.permissions.has('Administrator')) {
        return interaction.editReply({ content: 'You cannot ban someone with equal or higher roles.' });
      }
    }

    try {
      await interaction.guild.members.ban(targetUser, { reason, deleteMessageDays: deleteDays });

      const embed = new EmbedBuilder()
        .setTitle('Member Banned')
        .setColor(0xff0000)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Messages Deleted', value: `${deleteDays} days`, inline: true }
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
        action: 'ban',
        targetUser: `${targetUser.tag} (${targetUser.id})`,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        reason: reason,
        deleteDays: deleteDays.toString(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await interaction.editReply({ content: `Error banning user: ${error.message}` });
    }
  }
};

