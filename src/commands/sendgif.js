import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('sendgif')
    .setDescription('Send a GIF to a user via DM and tag them in a channel')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to send the GIF to')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to tag the user in')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('gif_url')
        .setDescription('The GIF URL to send')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Optional message to include with the GIF')
        .setRequired(false)
    ),
  async execute(interaction) {
    const config = await getGuildConfig(interaction.guild.id);
    if (!config) {
      return interaction.reply({ content: strings.errors.noConfig, ephemeral: true });
    }

    const member = interaction.member;
    const hasPermission = member.permissions.has('Administrator') || 
      (config.dragRole && member.roles.cache.has(config.dragRole));

    if (!hasPermission) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const targetChannel = interaction.options.getChannel('channel');
    const gifUrl = interaction.options.getString('gif_url');
    const message = interaction.options.getString('message') || '';

    if (targetChannel.type !== 0) {
      return interaction.editReply({ content: 'The channel must be a text channel.' });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('DEATH-X')
        .setColor(0xff0000);

      if (message) {
        embed.setDescription(message);
      }

      embed.setImage({ url: gifUrl });

      await targetUser.send({ embeds: [embed] });

      await targetChannel.send(`${targetUser} - Check your DMs!`);

      await logger.logDM(interaction.guild, {
        usedBy: `${interaction.user.username} (${interaction.user.id})`,
        targetUser: `${targetUser.username} (${targetUser.id})`,
        channel: targetChannel.name,
        gifUrl: gifUrl,
        timestamp: new Date().toISOString()
      });

      await interaction.editReply({ 
        content: `GIF sent to ${targetUser.username} and they were tagged in ${targetChannel.name}.` 
      });
    } catch (error) {
      await interaction.editReply({ 
        content: `Error: ${error.message}` 
      });
      
      await logger.logError(interaction.guild, {
        action: 'sendgif-error',
        userId: interaction.user.id,
        targetUserId: targetUser.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

