import { MongoClient } from 'mongodb';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mongoClient = null;
let sqliteDb = null;
let useMongo = false;

const sqlitePath = join(__dirname, '../../data.db');

export async function initDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (mongoUri) {
    try {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      await mongoClient.db().admin().ping();
      useMongo = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.log('MongoDB connection failed, using SQLite fallback');
      useMongo = false;
    }
  }

  if (!useMongo) {
    const dataDir = join(__dirname, '../../');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    sqliteDb = new Database(sqlitePath);
    
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS guild_configs (
        guildId TEXT PRIMARY KEY,
        dragRole TEXT,
        warVC TEXT,
        warPingRole TEXT,
        warDmRole TEXT,
        announcementChannel TEXT,
        warGifUrl TEXT,
        welcomeGifUrl TEXT,
        privateTriggerChannelId TEXT,
        joinRole TEXT
      );
      
      CREATE TABLE IF NOT EXISTS private_vcs (
        channelId TEXT PRIMARY KEY,
        guildId TEXT,
        ownerId TEXT,
        createdAt INTEGER
      );
    `);

    const columnsToAdd = [
      'commandLogChannel',
      'vcLogChannel',
      'messageLogChannel',
      'modLogChannel',
      'dmLogChannel',
      'warLogChannel',
      'joinLogChannel',
      'errorLogChannel'
    ];

    for (const column of columnsToAdd) {
      try {
        sqliteDb.exec(`ALTER TABLE guild_configs ADD COLUMN ${column} TEXT`);
      } catch (error) {
        if (!error.message.includes('duplicate column')) {
          console.error(`Error adding column ${column}:`, error);
        }
      }
    }
    
    console.log('Using SQLite database');
  }
}

export async function getGuildConfig(guildId) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('guild_configs');
    const config = await collection.findOne({ guildId });
    return config || null;
  } else {
    const stmt = sqliteDb.prepare('SELECT * FROM guild_configs WHERE guildId = ?');
    const row = stmt.get(guildId);
    return row || null;
  }
}

export async function saveGuildConfig(guildId, config) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('guild_configs');
    await collection.updateOne(
      { guildId },
      { $set: { ...config, guildId } },
      { upsert: true }
    );
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO guild_configs (
        guildId, dragRole, warVC, warPingRole, warDmRole,
        announcementChannel, warGifUrl, welcomeGifUrl,
        privateTriggerChannelId, joinRole, commandLogChannel,
        vcLogChannel, messageLogChannel, modLogChannel,
        dmLogChannel, warLogChannel, joinLogChannel, errorLogChannel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(guildId) DO UPDATE SET
        dragRole = excluded.dragRole,
        warVC = excluded.warVC,
        warPingRole = excluded.warPingRole,
        warDmRole = excluded.warDmRole,
        announcementChannel = excluded.announcementChannel,
        warGifUrl = excluded.warGifUrl,
        welcomeGifUrl = excluded.welcomeGifUrl,
        privateTriggerChannelId = excluded.privateTriggerChannelId,
        joinRole = excluded.joinRole,
        commandLogChannel = excluded.commandLogChannel,
        vcLogChannel = excluded.vcLogChannel,
        messageLogChannel = excluded.messageLogChannel,
        modLogChannel = excluded.modLogChannel,
        dmLogChannel = excluded.dmLogChannel,
        warLogChannel = excluded.warLogChannel,
        joinLogChannel = excluded.joinLogChannel,
        errorLogChannel = excluded.errorLogChannel
    `);
    stmt.run(
      guildId,
      config.dragRole || null,
      config.warVC || null,
      config.warPingRole || null,
      config.warDmRole || null,
      config.announcementChannel || null,
      config.warGifUrl || null,
      config.welcomeGifUrl || null,
      config.privateTriggerChannelId || null,
      config.joinRole || null,
      config.commandLogChannel || null,
      config.vcLogChannel || null,
      config.messageLogChannel || null,
      config.modLogChannel || null,
      config.dmLogChannel || null,
      config.warLogChannel || null,
      config.joinLogChannel || null,
      config.errorLogChannel || null
    );
  }
}

export async function getPrivateVC(channelId) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('private_vcs');
    return await collection.findOne({ channelId });
  } else {
    const stmt = sqliteDb.prepare('SELECT * FROM private_vcs WHERE channelId = ?');
    return stmt.get(channelId) || null;
  }
}

export async function savePrivateVC(channelId, guildId, ownerId) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('private_vcs');
    await collection.insertOne({
      channelId,
      guildId,
      ownerId,
      createdAt: Date.now()
    });
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO private_vcs (channelId, guildId, ownerId, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(channelId, guildId, ownerId, Date.now());
  }
}

export async function deletePrivateVC(channelId) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('private_vcs');
    await collection.deleteOne({ channelId });
  } else {
    const stmt = sqliteDb.prepare('DELETE FROM private_vcs WHERE channelId = ?');
    stmt.run(channelId);
  }
}

export async function getAllPrivateVCs(guildId) {
  if (useMongo) {
    const db = mongoClient.db();
    const collection = db.collection('private_vcs');
    return await collection.find({ guildId }).toArray();
  } else {
    const stmt = sqliteDb.prepare('SELECT * FROM private_vcs WHERE guildId = ?');
    return stmt.all(guildId);
  }
}

export async function closeDB() {
  if (mongoClient) {
    await mongoClient.close();
  }
  if (sqliteDb) {
    sqliteDb.close();
  }
}

