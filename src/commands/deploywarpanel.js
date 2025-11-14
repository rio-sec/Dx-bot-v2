import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deploywarpanel')
    .setDescription('Deploy war alert panel with buttons'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    const config = await getGuildConfig(interaction.guild.id);
    if (!config) {
      return interaction.reply({ content: strings.errors.noConfig, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('DEATH-X War Control Panel')
      .setDescription('Use the buttons below to trigger war alerts or send DM broadcasts.')
      .setColor(0xff0000);

    const warButton = new ButtonBuilder()
      .setCustomId('war_alert')
      .setLabel('WAR ALERT')
      .setStyle(ButtonStyle.Danger);

    const dmButton = new ButtonBuilder()
      .setCustomId('dm_all')
      .setLabel('DM ALL')
      .setStyle(ButtonStyle.Primary);

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(warButton, dmButton)
      ]
    });
  }
};

