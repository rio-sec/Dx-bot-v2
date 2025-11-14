import { getGuildConfig } from '../lib/db.js';
import { strings } from '../../config/strings.js';
import { Logger } from '../lib/logger.js';

const logger = new Logger();

export default {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (oldMember.pending && !newMember.pending) {
      return;
    }

    const config = await getGuildConfig(newMember.guild.id);
    if (!config) return;

    const joinRoleId = config.joinRole || config.warDmRole;
    if (!joinRoleId) return;

    const hadRole = oldMember.roles.cache.has(joinRoleId);
    const hasRole = newMember.roles.cache.has(joinRoleId);

    if (!hadRole && hasRole) {
      try {
        const defaultWelcomeGif = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXE1emt5N3hicTdwbzRrcGg2dHZ4YXdlaHZlMW92c2F2ZmsxYWtzZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GaHkmvYIRdq7kLPmXw/giphy.gif';
        const welcomeGifUrl = config.welcomeGifUrl || defaultWelcomeGif;

        const embed = {
          title: strings.welcome.title,
          description: strings.welcome.message,
          color: 0x00ff00,
          image: { url: welcomeGifUrl }
        };

        await newMember.send({ embeds: [embed] });

        await logger.logJoin(newMember.guild, {
          userId: newMember.id,
          username: newMember.user.username,
          roleId: joinRoleId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await logger.logError(newMember.guild, {
          action: 'welcome-dm-failed',
          userId: newMember.id,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

