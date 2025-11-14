import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getGuildConfig } from '../lib/db.js';
import { dragUsersToVC, getUsersInSpecificVC } from '../lib/vcMover.js';
import { Logger } from '../lib/logger.js';
import { strings } from '../../config/strings.js';

const logger = new Logger();

export default {
  data: new SlashCommandBuilder()
    .setName('dragcurrent')
    .setDescription('Drag all users from your current VC to target VC'),
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

    if (!member.voice?.channel) {
      return interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });
    }

    const vcSelect = new StringSelectMenuBuilder()
      .setCustomId('dragcurrent_vc')
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
      content: 'Select target VC:',
      components: [
        new ActionRowBuilder().addComponents(vcSelect)
      ],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.customId === 'dragcurrent_vc') {
        collector.stop();
        
        const targetVC = interaction.guild.channels.cache.get(i.values[0]);
        if (!targetVC) {
          await interaction.editReply({ content: strings.errors.noVC, components: [] });
          return;
        }

        try {
          const users = getUsersInSpecificVC(member.voice.channel);
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
            targetVC,
            logger,
            'dragcurrent',
            interaction.user
          );

          await interaction.editReply({
            content: `Moved ${result.movedCount} users to ${targetVC.name}`,
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

