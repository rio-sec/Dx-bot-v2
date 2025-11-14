import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset bot configuration to default values')
    .addStringOption(option =>
      option
        .setName('confirm')
        .setDescription('Type "RESET" to confirm')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    const confirm = interaction.options.getString('confirm');
    
    if (confirm !== 'RESET') {
      return interaction.reply({ 
        content: 'Invalid confirmation. Type "RESET" (all caps) to reset configuration.', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const defaultConfig = {
        guildId: interaction.guild.id,
        dragRole: null,
        warVC: null,
        warPingRole: null,
        warDmRole: null,
        announcementChannel: null,
        warGifUrl: '',
        welcomeGifUrl: '',
        privateTriggerChannelId: null,
        joinRole: null
      };

      await saveGuildConfig(interaction.guild.id, defaultConfig);

      const embed = new EmbedBuilder()
        .setTitle('Configuration Reset')
        .setDescription('All bot configuration has been reset to default values.')
        .setColor(0xff0000)
        .addFields(
          { name: 'Next Steps', value: 'Run `/setup` to configure the bot again.', inline: false }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Reset error:', error);
      await interaction.editReply({ 
        content: `Error resetting configuration: ${error.message}` 
      });
    }
  }
};

