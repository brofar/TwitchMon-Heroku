/* General */
const Dotenv = require('dotenv').config();
const postgres = require('postgres');

/* Local */
const log = require('./log');

const sql = postgres({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS
});

const className = '[db]';

class db {
    /**
     * Get distinct channel names from the database.
     */
    static async GetChannels() {
        const users = await sql`SELECT DISTINCT streamer FROM monitor`

        // Transform the result into an array of values
        let result = users.map(a => a.streamer);

        return Promise.resolve(result);
    }

    /**
     * Get all the discord messages from the db.
     */
    static async GetMessages() {
        const messages = await sql`SELECT * FROM livemessages`
        return Promise.resolve(messages);
    }

    /**
     * Delete messages from the DB
     */
    static async DeleteMessage(guildId, messageId) {
        await sql`DELETE FROM livemessages WHERE guildid = ${guildId} AND messageid = ${messageId}`
        return Promise.resolve();
    }

    static async AddMessage(guildId, channelId, messageId, streamer) {
        try {
            await sql`INSERT INTO livemessages (guildid, channelid, messageid, streamer) VALUES (${guildId}, ${channelId}, ${messageId}, ${streamer}) ON CONFLICT DO NOTHING`;
        } catch (e) {
            log.warn(className, `Couldn't create a new message config for ${streamer} in ${guildId}.`);
            console.warn(e);
        }
        return Promise.resolve();
    }

    static async GetGuildsPerStreamer(streamerArray) {
        const streamers = await sql`SELECT * FROM monitor WHERE streamer IN (${streamerArray})`
        return Promise.resolve(streamers);
    }

    /**
    * Get all configs for all guilds
    */
    static async GetAllConfigs() {
        const result = await sql`SELECT * FROM config`
        return Promise.resolve(result);
    }

    /**
     * Get config values for a guild
     */
    static async GetConfig(guildId) {
        const result = await sql`SELECT * FROM config WHERE guildid = ${guildId} LIMIT 1`
        return Promise.resolve(result[0]);
    }

    /**
     * Creates a config for a new guild
     */
    static async NewGuild(guildId) {
        try {
            await sql`INSERT INTO config (guildId, prefix, channelId) VALUES (${guildId}, '!', null)`;
        } catch (e) {
            log.warn(className, `Couldn't create a new guild config for ${guildId}.`);
            console.warn(e);
        }
        return Promise.resolve();
    }

    /**
     * Removes a config for a guild
     */
    static async KillGuild(guildId) {
        try {
            await sql`DELETE FROM config WHERE guildId = ${guildId}`;
            await sql`DELETE FROM monitor WHERE guildId = ${guildId}`;
            await sql`DELETE FROM livemessages WHERE guildId = ${guildId}`;
        } catch (e) {
            log.warn(className, `Couldn't remove guild config for ${guildId}.`);
        }
        return Promise.resolve();
    }

    /**
     * Updates a guild config property
     */
    static async UpdateGuild(guildId, prop, value) {
        let obj = { [prop]: value };
        try {
            await sql`UPDATE config SET ${sql(obj, prop)} WHERE guildid = ${guildId}`;
        } catch (e) {
            log.warn(className, `Couldn't update '${prop}' = '${value}' WHERE guildid = '${guildId}'.`);
            console.log(e);
        }
        return Promise.resolve();
    }

    /**
     * Add a streamer to a guild
     */
    static async AddStreamers(streamers) {
        try {
            await sql`INSERT INTO monitor ${sql(streamers, 'guildid', 'streamer')} ON CONFLICT DO NOTHING`;
        } catch (e) {
            log.warn(className, `Couldn't create a new guild config for ${guildId}.`);
            console.warn(e);
        }
        return Promise.resolve();
    }

    /**
     * Remove a streamer from a guild
     */
    static async RemStreamer(guildid, streamer) {
        try {
            await sql`DELETE FROM monitor WHERE streamer = ${streamer} AND guildid = ${guildid}`;
        } catch (e) {
            log.warn(className, `Couldn't create a new guild config for ${guildId}.`);
            console.warn(e);
        }
        return Promise.resolve();
    }
    /**
     * List watched streamers from a guild.
     */
    static async ListStreamers(guildid) {
        const users = await sql`SELECT streamer FROM monitor WHERE guildid = ${guildid}`

        // Transform the result into an array of values
        let result = users.map(a => a.streamer);

        return Promise.resolve(result);
    }
}

module.exports = db;