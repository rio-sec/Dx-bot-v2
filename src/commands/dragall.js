import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { dragUsersToVC, getUsersInVCs } from '../lib/vcMover.js';
import { Logger } from '../lib/logger.js';
import { strings } from '../../config/strings.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('dragall')
    .setDescription('Drag all users with a role from any VC to target VC'),
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

    const roleSelect = new StringSelectMenuBuilder()
      .setCustomId('dragall_role')
      .setPlaceholder('Select Role')
      .addOptions(
        interaction.guild.roles.cache
          .filter(r => !r.managed && r.id !== interaction.guild.id)
          .map(r => new StringSelectMenuOptionBuilder()
            .setLabel(r.name)
            .setValue(r.id)
          )
          .slice(0, 25)
      );

    const vcSelect = new StringSelectMenuBuilder()
      .setCustomId('dragall_vc')
      .setPlaceholder('Select Target VC')
      .addOptions(
        interaction.guild.channels.cache
          .filter(c => c.type === 2)
          .map(c => new StringSelectMenuOptionBuilder()
            .setLabel(c.name)
            .setValue(c.id)
          )
          .slice(0, 25)
      );

    await interaction.reply({
      content: 'Select role and target VC:',
      components: [
        new ActionRowBuilder().addComponents(roleSelect),
        new ActionRowBuilder().addComponents(vcSelect)
      ],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });

    let selectedRole = null;
    let selectedVC = null;

    collector.on('collect', async i => {
      if (i.customId === 'dragall_role') {
        selectedRole = interaction.guild.roles.cache.get(i.values[0]);
        await i.reply({ content: `Role selected: ${selectedRole.name}`, ephemeral: true });
      }

      if (i.customId === 'dragall_vc') {
        selectedVC = interaction.guild.channels.cache.get(i.values[0]);
        await i.reply({ content: `Target VC selected: ${selectedVC.name}`, ephemeral: true });
      }

      if (selectedRole && selectedVC) {
        collector.stop();
        
        try {
          const users = getUsersInVCs(interaction.guild, selectedRole);
          if (users.length === 0) {
            await interaction.editReply({ 
              content: strings.errors.noUsers,
              components: []
            });
            return;
          }

          const result = await dragUsersToVC(
            interaction.guild,
            users,
            selectedVC,
            logger,
            'dragall',
            interaction.user
          );

          await interaction.editReply({
            content: `Moved ${result.movedCount} users to ${selectedVC.name}`,
            components: []
          });
        } catch (error) {
          await interaction.editReply({
            content: error.message,
            components: []
          });
        }
      }
    });
  }
};

