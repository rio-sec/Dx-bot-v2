import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      return interaction.editReply({ content: 'User not found in this server.' });
    }

    if (!member.kickable) {
      return interaction.editReply({ content: 'I cannot kick this user. They may have higher permissions than me.' });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && !interaction.member.permissions.has('Administrator')) {
      return interaction.editReply({ content: 'You cannot kick someone with equal or higher roles.' });
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle('Member Kicked')
        .setColor(0xff9900)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
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
        action: 'kick',
        targetUser: `${targetUser.tag} (${targetUser.id})`,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        reason: reason,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await interaction.editReply({ content: `Error kicking user: ${error.message}` });
    }
  }
};

