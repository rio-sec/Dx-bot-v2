# DEATH-X BOT

Premium Discord bot for FiveM RP gang management.

## Features

- Intelligent VC management systems
- War alert system with DM broadcasting
- Role-based permissions
- Comprehensive logging
- Private VC auto-generation
- Welcome DM system
- Rotating presence

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DISCORD_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/deathx
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_guild_id_here
```

**For Replit:**
- Go to Secrets tab
- Add each variable as a secret

### 3. Deploy Slash Commands

```bash
npm run deploy
```

Or run manually:
```bash
node deploy-commands.js
```

### 4. Run the Bot

```bash
npm start
```

Or:
```bash
node src/index.js
```

## Commands

- `/setup` - Configure bot settings for your server
- `/dragall` - Drag all users with a role from any VC to target VC
- `/dragcurrent` - Drag all users from your current VC to target VC
- `/warpanel` - Configure war alert settings
- `/deploywarpanel` - Deploy war alert panel with buttons

## Logging Channels

The bot requires these channels (created automatically or manually):
- `vc-logs` - Voice channel operations
- `dm-logs` - DM broadcast events
- `war-logs` - War alert triggers
- `join-logs` - Member join events
- `error-logs` - Error tracking

## Database

- Primary: MongoDB (configure via MONGODB_URI)
- Fallback: SQLite (automatic if MongoDB unavailable)

## Permissions

The bot needs:
- Manage Channels
- Move Members
- Send Messages
- Embed Links
- Read Message History
- Use External Emojis
- Manage Roles (for private VC permissions)

## Support

Built by RIO for DEATH-X gang.

