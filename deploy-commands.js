import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

const commandsPath = join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

(async () => {
  for (const file of commandFiles) {
    try {
      const filePath = join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      if (command.default?.data) {
        const cmdData = command.default.data.toJSON();
        commands.push(cmdData);
        console.log(`Loaded command: ${cmdData.name || file}`);
      } else {
        console.log(`Skipping ${file}: no data property`);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message);
      if (error.stack) console.error(error.stack);
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    if (commands.length === 0) {
      console.error('No commands to deploy! Check for import errors above.');
      process.exit(1);
    }

    const guildId = process.env.GUILD_ID || '1427670272118624258';
    
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

