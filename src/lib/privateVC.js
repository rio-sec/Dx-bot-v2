import { getPrivateVC, savePrivateVC, deletePrivateVC } from './db.js';

const activeVCs = new Map();

export async function handlePrivateVCJoin(member, channel, config, logger) {
  if (channel.id !== config.privateTriggerChannelId) {
    return;
  }

  if (activeVCs.has(member.id)) {
    try {
      const existingVC = member.guild.channels.cache.get(activeVCs.get(member.id));
      if (existingVC && existingVC.members.has(member.id)) {
        return;
      }
      activeVCs.delete(member.id);
    } catch (error) {
      activeVCs.delete(member.id);
    }
  }

  try {
    const category = channel.parent;
    const newVC = await member.guild.channels.create({
      name: `${member.user.username}'s Private VC`,
      type: 2,
      parent: category?.id,
      permissionOverwrites: [
        {
          id: member.guild.id,
          deny: ['ViewChannel', 'Connect']
        },
        {
          id: member.id,
          allow: ['ViewChannel', 'Connect', 'ManageChannels']
        }
      ]
    });

    await member.voice.setChannel(newVC);
    await savePrivateVC(newVC.id, member.guild.id, member.id);
    activeVCs.set(member.id, newVC.id);

    await logger.logVC(member.guild, {
      action: 'private-vc-created',
      userId: member.id,
      username: member.user.username,
      channelId: newVC.id,
      channelName: newVC.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating private VC:', error);
    await logger.logError(member.guild, {
      action: 'private-vc-creation-failed',
      userId: member.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

export async function handlePrivateVCLeave(channel, logger) {
  if (channel.members.size > 0) {
    return;
  }

  const vcData = await getPrivateVC(channel.id);
  if (!vcData) {
    return;
  }

  try {
    await channel.delete();
    await deletePrivateVC(channel.id);
    
    if (activeVCs.has(vcData.ownerId)) {
      activeVCs.delete(vcData.ownerId);
    }

    const guild = channel.guild;
    await logger.logVC(guild, {
      action: 'private-vc-deleted',
      channelId: channel.id,
      channelName: channel.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting private VC:', error);
    await logger.logError(channel.guild, {
      action: 'private-vc-deletion-failed',
      channelId: channel.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

