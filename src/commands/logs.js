import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Configure log channels for bot activities')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type of log to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Command Logs', value: 'commandLogChannel' },
          { name: 'VC Logs', value: 'vcLogChannel' },
          { name: 'Message Logs', value: 'messageLogChannel' },
          { name: 'Moderation Logs', value: 'modLogChannel' },
          { name: 'DM Logs', value: 'dmLogChannel' },
          { name: 'War Logs', value: 'warLogChannel' },
          { name: 'Join Logs', value: 'joinLogChannel' },
          { name: 'Error Logs', value: 'errorLogChannel' }
        )
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to send logs to (type channel name to search)')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const config = await getGuildConfig(guild.id) || {};

    const logType = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== 0) {
      return interaction.editReply({ content: 'The channel must be a text channel.' });
    }

    const logTypeNames = {
      'commandLogChannel': 'Command Logs',
      'vcLogChannel': 'VC Logs',
      'messageLogChannel': 'Message Logs',
      'modLogChannel': 'Moderation Logs',
      'dmLogChannel': 'DM Logs',
      'warLogChannel': 'War Logs',
      'joinLogChannel': 'Join Logs',
      'errorLogChannel': 'Error Logs'
    };

    try {
      config[logType] = channel.id;
      config.guildId = guild.id;
      await saveGuildConfig(guild.id, config);

      const embed = new EmbedBuilder()
        .setTitle('Log Channel Updated')
        .setDescription(`**${logTypeNames[logType]}** has been set to ${channel}`)
        .setColor(0x00ff00)
        .addFields(
          { name: 'Current Log Channels', value: Object.entries(logTypeNames).map(([id, name]) => {
            const channelId = config[id];
            const ch = channelId ? guild.channels.cache.get(channelId) : null;
            return `**${name}**: ${ch ? `<#${channelId}>` : 'Not set'}`;
          }).join('\n'), inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }
};

