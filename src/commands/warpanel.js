import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warpanel')
    .setDescription('Configure war alert settings'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const config = await getGuildConfig(guild.id) || {};

    const warVCSelect = new StringSelectMenuBuilder()
      .setCustomId('warpanel_warVC')
      .setPlaceholder('Select War VC')
      .addOptions(
        guild.channels.cache
          .filter(c => c.type === 2)
          .map(c => new StringSelectMenuOptionBuilder()
            .setLabel(c.name)
            .setValue(c.id)
            .setDefault(config.warVC === c.id)
          )
          .slice(0, 25)
      );

    const warPingRoleSelect = new StringSelectMenuBuilder()
      .setCustomId('warpanel_warPingRole')
      .setPlaceholder('Select War Ping Role')
      .addOptions(
        guild.roles.cache
          .filter(r => !r.managed && r.id !== guild.id)
          .map(r => new StringSelectMenuOptionBuilder()
            .setLabel(r.name)
            .setValue(r.id)
            .setDefault(config.warPingRole === r.id)
          )
          .slice(0, 25)
      );

    const warDmRoleSelect = new StringSelectMenuBuilder()
      .setCustomId('warpanel_warDmRole')
      .setPlaceholder('Select War DM Role')
      .addOptions(
        guild.roles.cache
          .filter(r => !r.managed && r.id !== guild.id)
          .map(r => new StringSelectMenuOptionBuilder()
            .setLabel(r.name)
            .setValue(r.id)
            .setDefault(config.warDmRole === r.id)
          )
          .slice(0, 25)
      );

    const announcementSelect = new StringSelectMenuBuilder()
      .setCustomId('warpanel_announcementChannel')
      .setPlaceholder('Select Announcement Channel')
      .addOptions(
        guild.channels.cache
          .filter(c => c.type === 0)
          .map(c => new StringSelectMenuOptionBuilder()
            .setLabel(c.name)
            .setValue(c.id)
            .setDefault(config.announcementChannel === c.id)
          )
          .slice(0, 25)
      );

    const warGifButton = new ButtonBuilder()
      .setCustomId('warpanel_warGifUrl')
      .setLabel('Set War GIF URL')
      .setStyle(ButtonStyle.Secondary);

    const welcomeGifButton = new ButtonBuilder()
      .setCustomId('warpanel_welcomeGifUrl')
      .setLabel('Set Welcome GIF URL')
      .setStyle(ButtonStyle.Secondary);

    const embed = new EmbedBuilder()
      .setTitle('War Panel Configuration')
      .setDescription('Configure war alert settings using the menus below.')
      .setColor(0xff0000);

    await interaction.editReply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(warVCSelect),
        new ActionRowBuilder().addComponents(warPingRoleSelect),
        new ActionRowBuilder().addComponents(warDmRoleSelect),
        new ActionRowBuilder().addComponents(announcementSelect),
        new ActionRowBuilder().addComponents(warGifButton, welcomeGifButton)
      ]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 300000
    });

    let currentConfig = { ...config, guildId: guild.id };

    collector.on('collect', async i => {
      if (i.customId.startsWith('warpanel_')) {
        if (i.isStringSelectMenu()) {
          const field = i.customId.replace('warpanel_', '');
          currentConfig[field] = i.values[0];
          await saveGuildConfig(guild.id, currentConfig);
          await i.reply({ content: `${field} updated!`, ephemeral: true });
        } else if (i.isButton()) {
          const field = i.customId.replace('warpanel_', '');
          await i.showModal({
            title: `Set ${field === 'warGifUrl' ? 'War' : 'Welcome'} GIF URL`,
            customId: `warpanel_modal_${field}`,
            components: [{
              type: 1,
              components: [{
                type: 4,
                customId: 'gif_url',
                label: 'GIF URL',
                style: 1,
                required: true,
                placeholder: 'Enter the GIF URL...',
                value: currentConfig[field] || ''
              }]
            }]
          });
        }
      }
    });

    const modalCollector = interaction.channel.createModalSubmitCollector({
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('warpanel_modal_'),
      time: 300000
    });

    modalCollector.on('collect', async i => {
      try {
        await i.deferReply({ ephemeral: true });
        const field = i.customId.replace('warpanel_modal_', '');
        const url = i.fields.getTextInputValue('gif_url');
        
        if (!url || url.trim() === '') {
          await i.editReply({ content: 'GIF URL cannot be empty!' });
          return;
        }
        
        currentConfig[field] = url.trim();
        await saveGuildConfig(guild.id, currentConfig);
        await i.editReply({ content: `${field} updated successfully!` });
      } catch (error) {
        console.error('Modal error:', error);
        if (i.deferred || i.replied) {
          await i.editReply({ content: `Error: ${error.message}` });
        } else {
          await i.reply({ content: `Error: ${error.message}`, ephemeral: true });
        }
      }
    });

    collector.on('end', async () => {
      await interaction.editReply({ 
        content: 'War panel configuration saved!',
        embeds: [],
        components: []
      });
    });
  }
};

