import { dragUsersToVC, getUsersInVCs } from './vcMover.js';
import { strings } from '../../config/strings.js';

export async function triggerWarAlert(guild, config, logger, triggerUser) {
  const warVC = guild.channels.cache.get(config.warVC);
  if (!warVC) {
    throw new Error('War VC not configured');
  }

  const warDmRole = guild.roles.cache.get(config.warDmRole);
  if (!warDmRole) {
    throw new Error('War DM role not configured');
  }

  const membersToDM = guild.members.cache.filter(m => 
    m.roles.cache.has(config.warDmRole) && !m.user.bot
  );

  let dmCount = 0;
  const dmErrors = [];

  const defaultWarGif = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzk1OGkwZ2t3c2ViYWFsNWt3YzByeGRyc3o5cHFqdjV5d2U5bDR2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/47GPgxwNywcvsW4i5O/giphy.gif';
  const warGifUrl = config.warGifUrl || defaultWarGif;

  for (const member of membersToDM.values()) {
    try {
      const dmEmbed = {
        title: strings.war.alertTitle,
        description: strings.war.alertMessage,
        color: 0xff0000,
        image: { url: warGifUrl }
      };

      await member.send({ embeds: [dmEmbed] });
      dmCount++;
    } catch (error) {
      dmErrors.push(`${member.id}: ${error.message}`);
    }
  }

  const usersToMove = getUsersInVCs(guild, warDmRole);
  const { movedCount } = await dragUsersToVC(
    guild,
    usersToMove,
    warVC,
    null,
    'war-alert',
    triggerUser
  );

  const announcementChannel = guild.channels.cache.get(config.announcementChannel);
  if (announcementChannel) {
    const roleMention = config.warPingRole ? `<@&${config.warPingRole}>` : '';
    await announcementChannel.send(
      `${roleMention}\n` +
      `${strings.war.announcementPrefix} ${triggerUser.username || triggerUser.user?.username || 'Unknown'}\n` +
      `ROLE: ${warDmRole.name}\n` +
      `${strings.war.connectMessage}`
    );
  }

  const username = triggerUser.username || triggerUser.user?.username || 'Unknown';
  const userId = triggerUser.id || triggerUser.user?.id || 'unknown';
  
  await logger.logWar(guild, {
    usedBy: `${username} (${userId})`,
    roleTargeted: warDmRole.name,
    movedCount: movedCount.toString(),
    dmCount: dmCount.toString(),
    timestamp: new Date().toISOString()
  });

  return { movedCount, dmCount, dmErrors };
}

export async function sendDMBroadcast(guild, config, message, logger, triggerUser) {
  const warDmRole = guild.roles.cache.get(config.warDmRole);
  if (!warDmRole) {
    throw new Error('War DM role not configured');
  }

  const membersToDM = guild.members.cache.filter(m => 
    m.roles.cache.has(config.warDmRole) && !m.user.bot
  );

  let dmCount = 0;
  const dmErrors = [];

  for (const member of membersToDM.values()) {
    try {
      await member.send(message);
      dmCount++;
    } catch (error) {
      dmErrors.push(`${member.id}: ${error.message}`);
    }
  }

  const username = triggerUser.username || triggerUser.user?.username || 'Unknown';
  const userId = triggerUser.id || triggerUser.user?.id || 'unknown';
  
  await logger.logDM(guild, {
    usedBy: `${username} (${userId})`,
    message: message.substring(0, 100),
    dmCount: dmCount.toString(),
    timestamp: new Date().toISOString()
  });

  return { dmCount, dmErrors };
}

