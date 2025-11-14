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

## Replit Hosting

The bot includes a keep-alive HTTP server that runs on port 3000 to prevent the bot from going to sleep.

### Setup on Replit:

1. **Import from GitHub:**
   - Go to Replit
   - Click "Import from GitHub"
   - Enter: `https://github.com/rio-sec/Dx-bot-v2.git`

2. **Set Environment Variables:**
   - Go to Secrets tab (lock icon)
   - Add these secrets:
     - `DISCORD_TOKEN` - Your bot token
     - `MONGODB_URI` - MongoDB connection string (optional)
     - `CLIENT_ID` - Your bot client ID
     - `GUILD_ID` - Your server ID

3. **Run the Bot:**
   - Click "Run" button
   - The bot will start automatically

4. **Keep Bot Alive:**
   - The bot includes a built-in HTTP server on port 3000
   - For additional uptime, use a service like UptimeRobot:
     - Create account at https://uptimerobot.com
     - Add a new monitor
     - Type: HTTP(s)
     - URL: `https://your-repl-url.repl.co` (or use the HTTP server endpoint)
     - Interval: 5 minutes

5. **Deploy Commands:**
   - Run `npm run deploy` in the Replit shell after setting up environment variables

### Keep-Alive Server

The bot automatically starts an HTTP server on port 3000 that responds to requests. This helps keep the bot active on Replit.

## Support

Built by RIO for DEATH-X gang.

