import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure bot settings for your server'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const config = await getGuildConfig(guild.id) || {};

    const roles = guild.roles.cache
      .filter(r => !r.managed && r.id !== guild.id)
      .map(r => new StringSelectMenuOptionBuilder()
        .setLabel(r.name)
        .setValue(r.id)
        .setDefault(config.dragRole === r.id)
      )
      .slice(0, 25);

    const roleSelect = new StringSelectMenuBuilder()
      .setCustomId('setup_dragRole')
      .setPlaceholder('Select Drag Role')
      .addOptions(roles.length > 0 ? roles : [
        new StringSelectMenuOptionBuilder()
          .setLabel('No roles available')
          .setValue('none')
          .setDescription('Create roles first')
      ]);

    const warDmRoles = guild.roles.cache
      .filter(r => !r.managed && r.id !== guild.id)
      .map(r => new StringSelectMenuOptionBuilder()
        .setLabel(r.name)
        .setValue(r.id)
        .setDefault(config.warDmRole === r.id)
      )
      .slice(0, 25);

    const warDmRoleSelect = new StringSelectMenuBuilder()
      .setCustomId('setup_warDmRole')
      .setPlaceholder('Select War DM Role')
      .addOptions(warDmRoles.length > 0 ? warDmRoles : [
        new StringSelectMenuOptionBuilder()
          .setLabel('No roles available')
          .setValue('none')
          .setDescription('Create roles first')
      ]);

    const textChannels = guild.channels.cache
      .filter(c => c.type === 0)
      .map(c => new StringSelectMenuOptionBuilder()
        .setLabel(c.name)
        .setValue(c.id)
        .setDefault(config.announcementChannel === c.id)
      )
      .slice(0, 25);

    const announcementSelect = new StringSelectMenuBuilder()
      .setCustomId('setup_announcementChannel')
      .setPlaceholder('Select Announcement Channel')
      .addOptions(textChannels.length > 0 ? textChannels : [
        new StringSelectMenuOptionBuilder()
          .setLabel('No text channels available')
          .setValue('none')
          .setDescription('Create text channels first')
      ]);

    const privateVCs = guild.channels.cache
      .filter(c => c.type === 2 && c.name.toLowerCase() === 'private')
      .map(c => new StringSelectMenuOptionBuilder()
        .setLabel(c.name)
        .setValue(c.id)
        .setDefault(config.privateTriggerChannelId === c.id)
      )
      .slice(0, 25);

    const privateVCSelect = new StringSelectMenuBuilder()
      .setCustomId('setup_privateTriggerChannelId')
      .setPlaceholder('Select Private VC Trigger')
      .addOptions(
        privateVCs.length > 0 ? privateVCs : [
          new StringSelectMenuOptionBuilder()
            .setLabel('No "Private" VC found - Create one first')
            .setValue('none')
            .setDescription('Create a VC named "Private" to use this feature')
        ]
      );

    const joinRoles = guild.roles.cache
      .filter(r => !r.managed && r.id !== guild.id)
      .map(r => new StringSelectMenuOptionBuilder()
        .setLabel(r.name)
        .setValue(r.id)
        .setDefault(config.joinRole === r.id)
      )
      .slice(0, 25);

    const joinRoleSelect = new StringSelectMenuBuilder()
      .setCustomId('setup_joinRole')
      .setPlaceholder('Select Join Role (for welcome DM)')
      .addOptions(joinRoles.length > 0 ? joinRoles : [
        new StringSelectMenuOptionBuilder()
          .setLabel('No roles available')
          .setValue('none')
          .setDescription('Create roles first')
      ]);

    const embed = new EmbedBuilder()
      .setTitle('DEATH-X BOT Setup')
      .setDescription('Configure essential settings. Use /warpanel for war-specific settings.')
      .setColor(0x00ff00);

    await interaction.editReply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(roleSelect),
        new ActionRowBuilder().addComponents(warDmRoleSelect),
        new ActionRowBuilder().addComponents(announcementSelect),
        new ActionRowBuilder().addComponents(privateVCSelect),
        new ActionRowBuilder().addComponents(joinRoleSelect)
      ]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 300000
    });

    let currentConfig = { ...config, guildId: guild.id };

    collector.on('collect', async i => {
      if (i.customId.startsWith('setup_')) {
        const field = i.customId.replace('setup_', '');
        const value = i.values[0];
        
        if (value === 'none') {
          await i.reply({ content: `Please create the required items first (roles/channels) before selecting ${field}.`, ephemeral: true });
          return;
        }
        
        currentConfig[field] = value;
        await saveGuildConfig(guild.id, currentConfig);
        await i.reply({ content: `${field} updated!`, ephemeral: true });
      }
    });

    collector.on('end', async () => {
      await interaction.editReply({ 
        content: 'Setup completed! Configuration saved.',
        embeds: [],
        components: []
      });
    });
  }
};

