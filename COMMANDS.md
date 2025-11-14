# DEATH-X BOT - Commands & Usage Guide

## Setup Commands

### `/setup`
**Description:** Configure bot settings for your server  
**Permission:** Administrator only  
**Usage:**
1. Run `/setup` in any channel
2. Use the dropdown menus to select:
   - **Drag Role** - Role that can use drag commands
   - **War VC** - Voice channel for war alerts
   - **War Ping Role** - Role to ping in war announcements
   - **War DM Role** - Role that receives war alert DMs
   - **Announcement Channel** - Channel for war announcements
   - **Private VC Trigger** - The "Private" VC channel (must be named "Private")
   - **Join Role** - Role that triggers welcome DM when received

**Note:** All selections are saved automatically. The setup panel expires after 5 minutes.

---

### `/warpanel`
**Description:** Configure war alert settings  
**Permission:** Administrator only  
**Usage:**
1. Run `/warpanel` in any channel
2. Use dropdown menus to configure:
   - **War VC** - Target voice channel for war alerts
   - **War Ping Role** - Role to mention in announcements
   - **War DM Role** - Role that receives DMs
   - **Announcement Channel** - Channel for war alerts
3. Use buttons to set:
   - **Set War GIF URL** - GIF sent in war alert DMs (default provided)
   - **Set Welcome GIF URL** - GIF sent in welcome DMs (default provided)

---

## Voice Channel Management

### `/dragall`
**Description:** Drag all users with a specific role from any VC to target VC  
**Permission:** Administrator or users with Drag Role  
**Usage:**
1. Run `/dragall`
2. Select the **role** from the dropdown
3. Select the **target VC** from the dropdown
4. All users with that role who are in any VC will be moved

**Example:** Drag all members with "Gang Member" role to "War VC"

---

### `/dragcurrent`
**Description:** Drag all users from your current VC to target VC  
**Permission:** Administrator or users with Drag Role  
**Usage:**
1. Join a voice channel
2. Run `/dragcurrent`
3. Select the **target VC** from the dropdown
4. All users in your current VC will be moved

**Example:** You're in "Lobby VC" → Run command → Select "War VC" → Everyone in Lobby moves to War VC

---

## War Alert System

### `/deploywarpanel`
**Description:** Deploy the war control panel with buttons  
**Permission:** Administrator only  
**Usage:**
1. Run `/deploywarpanel` in the channel where you want the panel
2. A panel with two buttons will appear:
   - **WAR ALERT** - Triggers war alert system
   - **DM ALL** - Send custom DM to all war DM role members

**Note:** This command only needs to be run once. The panel persists until deleted.

---

### War Alert Button
**Description:** Trigger war alert system  
**Permission:** Administrator or users with Drag Role  
**Usage:**
1. Click the **WAR ALERT** button on the deployed panel
2. The bot will:
   - Send DM to all users with War DM Role (includes GIF)
   - Move all users with War DM Role from any VC to War VC
   - Send announcement in configured channel
   - Log the event

**What happens:**
- All members with War DM Role receive: "SITUATION ONGOING – CONNECT CITY / MOVE TO WAR VC IMMEDIATELY – DEATH-X" with GIF
- All members with War DM Role in any VC are moved to War VC
- Announcement sent: "WAR ALERT TRIGGERED BY [username] / ROLE: [role name] / CONNECT CITY IMMEDIATELY"

---

### DM ALL Button
**Description:** Send custom message to all War DM Role members  
**Permission:** Administrator or users with Drag Role  
**Usage:**
1. Click the **DM ALL** button on the deployed panel
2. A modal will appear
3. Type your custom message
4. Click Submit
5. All members with War DM Role will receive the message via DM

---

## GIF & Messaging

### `/sendgif`
**Description:** Send a GIF to a user via DM and tag them in a channel  
**Permission:** Administrator or users with Drag Role  
**Usage:**
```
/sendgif user:@username channel:#channel-name gif_url:https://example.com/gif.gif message:Optional message
```

**Parameters:**
- **user** (required) - The user to send the GIF to
- **channel** (required) - The channel to tag the user in
- **gif_url** (required) - The GIF URL to send
- **message** (optional) - Optional message to include with the GIF

**Example:**
```
/sendgif user:@JohnDoe channel:#general gif_url:https://media.giphy.com/example.gif message:Check this out!
```

**What happens:**
- User receives DM with the GIF and optional message
- User is tagged in the specified channel: "@JohnDoe - Check your DMs!"
- Event is logged

---

## Automatic Features

### Private VC System
**Description:** Auto-creates private voice channels  
**How it works:**
1. Create a voice channel named "Private" (case-insensitive)
2. Configure it in `/setup` as "Private VC Trigger"
3. When a user joins the "Private" channel:
   - A new VC is created: "[Username]'s Private VC"
   - User is moved to the new VC
   - Only that user and admins can see/access it
4. When the private VC becomes empty, it's automatically deleted

**No commands needed** - Works automatically once configured!

---

### Welcome DM System
**Description:** Sends welcome DM when user receives gang role  
**How it works:**
1. Configure "Join Role" in `/setup`
2. When a member receives that role:
   - They automatically get a DM: "WELCOME TO DEATH-X-OFFICIAL"
   - Includes welcome GIF (default or custom from `/warpanel`)
   - Event is logged

**No commands needed** - Works automatically once configured!

---

## Logging Channels

The bot automatically creates and uses these log channels:

- **vc-logs** - Voice channel operations (drags, private VC creation/deletion)
- **dm-logs** - DM broadcast events
- **war-logs** - War alert triggers
- **join-logs** - Member join/welcome events
- **error-logs** - Error tracking

All logs are plain text with ISO8601 timestamps, no emojis.

---

## Quick Start Checklist

1. ✅ Run `/setup` and configure all settings
2. ✅ Run `/warpanel` to configure war settings and GIF URLs
3. ✅ Run `/deploywarpanel` in your announcement channel
4. ✅ Create a voice channel named "Private" for private VC system
5. ✅ Test `/dragall` and `/dragcurrent` commands
6. ✅ Test `/sendgif` command
7. ✅ Test War Alert button

---

## Default GIF URLs

**War Alert GIF:**
```
https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzk1OGkwZ2t3c2ViYWFsNWt3YzByeGRyc3o5cHFqdjV5d2U5bDR2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/47GPgxwNywcvsW4i5O/giphy.gif
```

**Welcome GIF:**
```
https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXE1emt5N3hicTdwbzRrcGg2dHZ4YXdlaHZlMW92c2F2ZmsxYWtzZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GaHkmvYIRdq7kLPmXw/giphy.gif
```

These are used by default if not configured in `/warpanel`.

---

## Troubleshooting

**Commands not showing?**
- Run `npm run deploy` to register commands
- Make sure bot has proper permissions

**War alert not working?**
- Check `/setup` configuration
- Verify War DM Role is set
- Check bot permissions (Move Members, Send Messages)

**Private VC not creating?**
- Channel must be named exactly "Private" (case-insensitive)
- Must be configured in `/setup`
- Bot needs "Manage Channels" permission

**Welcome DM not sending?**
- Check Join Role is configured in `/setup`
- Verify bot can DM users (some users block DMs)
- Check error-logs channel

---

Built by RIO for DEATH-X gang.

