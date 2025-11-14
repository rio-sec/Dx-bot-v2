import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isModalSubmit()) {
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
        
        if (interaction.guild) {
          const config = await getGuildConfig(interaction.guild.id);
          if (config?.commandLogChannel) {
            await logger.logCommand(interaction.guild, {
              command: interaction.commandName,
              user: `${interaction.user.tag} (${interaction.user.id})`,
              channel: interaction.channel?.name || 'DM',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Command error:', error);
        
        const errorMsg = error.message || strings.errors.generic;
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMsg, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMsg, ephemeral: true });
        }

        if (interaction.guild) {
          await logger.logError(interaction.guild, {
            action: 'command-error',
            command: interaction.commandName,
            userId: interaction.user.id,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'war_alert') {
        const config = await getGuildConfig(interaction.guild.id);
        if (!config) {
          await interaction.reply({ content: strings.errors.noConfig, ephemeral: true });
          return;
        }

        const member = interaction.member;
        const hasPermission = member.permissions.has('Administrator') || 
          (config.dragRole && member.roles.cache.has(config.dragRole));

        if (!hasPermission) {
          await interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
          const { triggerWarAlert } = await import('../lib/war.js');
          const result = await triggerWarAlert(interaction.guild, config, logger, interaction.user);
          await interaction.followUp({ 
            content: `War alert triggered! Moved ${result.movedCount} users, sent ${result.dmCount} DMs.`, 
            ephemeral: true 
          });
        } catch (error) {
          await interaction.followUp({ content: error.message, ephemeral: true });
        }
      }

      if (interaction.customId === 'dm_all') {
        const config = await getGuildConfig(interaction.guild.id);
        if (!config) {
          await interaction.reply({ content: strings.errors.noConfig, ephemeral: true });
          return;
        }

        const member = interaction.member;
        const hasPermission = member.permissions.has('Administrator') || 
          (config.dragRole && member.roles.cache.has(config.dragRole));

        if (!hasPermission) {
          await interaction.reply({ content: strings.errors.noPermission, ephemeral: true });
          return;
        }

        await interaction.showModal({
          title: 'DM Broadcast',
          customId: 'dm_modal',
          components: [{
            type: 1,
            components: [{
              type: 4,
              customId: 'dm_message',
              label: 'Message',
              style: 2,
              required: true,
              placeholder: 'Enter the message to send to all members...'
            }]
          }]
        });
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'dm_modal') {
        const config = await getGuildConfig(interaction.guild.id);
        if (!config) {
          await interaction.reply({ content: strings.errors.noConfig, ephemeral: true });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        const message = interaction.fields.getTextInputValue('dm_message');
        
        try {
          const { sendDMBroadcast } = await import('../lib/war.js');
          const result = await sendDMBroadcast(interaction.guild, config, message, logger, interaction.user);
          await interaction.followUp({ 
            content: `DM broadcast sent to ${result.dmCount} members.`, 
            ephemeral: true 
          });
        } catch (error) {
          await interaction.followUp({ content: error.message, ephemeral: true });
        }
      } else if (interaction.customId.startsWith('warpanel_modal_')) {
        const config = await getGuildConfig(interaction.guild.id) || {};
        const field = interaction.customId.replace('warpanel_modal_', '');
        const url = interaction.fields.getTextInputValue('gif_url');
        
        try {
          await interaction.deferReply({ ephemeral: true });
          
          if (!url || url.trim() === '') {
            await interaction.editReply({ content: 'GIF URL cannot be empty!' });
            return;
          }
          
          config[field] = url.trim();
          config.guildId = interaction.guild.id;
          
          const { saveGuildConfig } = await import('../lib/db.js');
          await saveGuildConfig(interaction.guild.id, config);
          await interaction.editReply({ content: `${field} updated successfully!` });
        } catch (error) {
          console.error('Modal error:', error);
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `Error: ${error.message}` });
          } else {
            await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
          }
        }
      }
    }
  }
};

