export async function dragUsersToVC(guild, users, targetVC, logger, action, usedBy) {
  if (!targetVC || targetVC.type !== 2) {
    throw new Error('Invalid target voice channel');
  }

  let movedCount = 0;
  const errors = [];

  for (const user of users) {
    try {
      if (user.voice?.channel) {
        await user.voice.setChannel(targetVC);
        movedCount++;
      }
    } catch (error) {
      errors.push(`${user.id}: ${error.message}`);
    }
  }

  if (logger) {
    const username = usedBy?.username || usedBy?.user?.username || 'Unknown';
    const userId = usedBy?.id || usedBy?.user?.id || 'unknown';
    
    await logger.logVC(guild, {
      usedBy: `${username} (${userId})`,
      action: action,
      targetVC: targetVC.name,
      targetVCId: targetVC.id,
      movedCount: movedCount.toString(),
      failedCount: errors.length.toString(),
      timestamp: new Date().toISOString()
    });
  }

  return { movedCount, errors };
}

export function getUsersInVCs(guild, role) {
  const users = [];
  
  for (const member of guild.members.cache.values()) {
    if (member.voice?.channel && member.roles.cache.has(role.id)) {
      users.push(member);
    }
  }
  
  return users;
}

export function getUsersInSpecificVC(voiceChannel) {
  return Array.from(voiceChannel.members.values());
}

