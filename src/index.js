import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { initDB } from './lib/db.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command.default?.data?.name) {
    client.commands.set(command.default.data.name, command.default);
  }
}

const eventsPath = join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = await import(`file://${filePath}`);
  if (event.default?.name) {
    if (event.default.once) {
      client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
      client.on(event.default.name, (...args) => event.default.execute(...args));
    }
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

await initDB();
await client.login(process.env.DISCORD_TOKEN);

