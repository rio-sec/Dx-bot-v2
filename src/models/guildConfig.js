export class GuildConfig {
  constructor(data) {
    this.guildId = data.guildId;
    this.dragRole = data.dragRole || null;
    this.warVC = data.warVC || null;
    this.warPingRole = data.warPingRole || null;
    this.warDmRole = data.warDmRole || null;
    this.announcementChannel = data.announcementChannel || null;
    this.warGifUrl = data.warGifUrl || '';
    this.welcomeGifUrl = data.welcomeGifUrl || '';
    this.privateTriggerChannelId = data.privateTriggerChannelId || null;
    this.joinRole = data.joinRole || null;
  }

  toJSON() {
    return {
      guildId: this.guildId,
      dragRole: this.dragRole,
      warVC: this.warVC,
      warPingRole: this.warPingRole,
      warDmRole: this.warDmRole,
      announcementChannel: this.announcementChannel,
      warGifUrl: this.warGifUrl,
      welcomeGifUrl: this.welcomeGifUrl,
      privateTriggerChannelId: this.privateTriggerChannelId,
      joinRole: this.joinRole
    };
  }
}

