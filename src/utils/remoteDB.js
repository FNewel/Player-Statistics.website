"use server";

import mysql from 'mysql2/promise';

const statTables = ['broken', 'crafted', 'custom', 'dropped', 'killed', 'killed_by', 'mined', 'picked_up', 'used'];


/**
 * Connect to the database with the provided credentials
 * @returns {Promise<mysql.Connection>}
 */
async function dbConnect() {
    return await mysql.createConnection({
        host: process.env.DB_URL,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_SCHEMA,
    });
}

/**
 * Get all players from the database
 * Function asynchronously gets all players data (ID, UUID, name and last online date) from the database
 * @returns {Promise<{
*                      success: boolean,
*                      error: string,
*                      players: Array<{id: number, uuid: string, nick: string, last_online: Date}>
*                    }>
*          }
*/
export async function getAllPlayers() {
    let connection = await dbConnect();

    try {
        await connection.beginTransaction();

        // Get all players from database (uuid_map table)
        const [rows] = await connection.execute("SELECT * FROM uuid_map");
        const players = rows.map((row) => ({
            id: row.id,
            uuid: row.player_uuid,
            nick: row.player_nick,
            last_online: row.player_last_online,
        }));

        // Check if there are any players
        if (players.length === 0) {
            return { success: false, error: "No players found" };
        }

        return { success: true, players };

    } catch (err) {
        const err_msg = err.message;
        console.error("ERROR (getAllPlayers):", err);
        return { success: false, error: err_msg };
    } finally {
        await connection.end();
    }
}

/**
 * Get player's data from database by UUID
 * Function asynchronously gets player's data (UUID, name and last online date) from the database by UUID
 * @param {string} uuid - Player's UUID
 * @returns {Promise<{
*                      success: boolean,
*                      error: string,
*                      player: Array<{
*                          nick: string,
*                          uuid: string,
*                          last_online: Date,
*                          hof: number,
*                          stats: Array<{stat_name: Array<{name: string, value: number, position: number}>}>
*                      }>
*                  }>
*          }
*/
export async function getPlayerDataByUUID(UUID) {
    let connection;

    try {
        connection = await dbConnect();

        // Fetch player's basic info (UUID, nickname, last online)
        const [playerRows] = await connection.execute(
            `SELECT id AS player_id, player_uuid AS uuid, player_nick AS nick, player_last_online AS last_online
                FROM uuid_map 
                WHERE player_uuid = ? LIMIT 1`,
            [UUID]
        );

        if (playerRows.length === 0) {
            return { success: false, error: 'Player not found', player: null };
        }

        const player = playerRows[0];

        // Fetch player's hall of fame score
        const [hofRows] = await connection.execute(
            `SELECT score
                FROM hall_of_fame 
                WHERE player_id = ? LIMIT 1`,
            [player.player_id]
        );

        const hofScore = hofRows.length > 0 ? hofRows[0].score : 0;

        // Fetch player's statistics
        const stats = {};
        for (const table of statTables) {
            const [statRows] = await connection.execute(
                `SELECT stat_name, amount AS value, position 
                    FROM ${table} 
                    WHERE player_id = ?
                    ORDER BY position ASC`,
                [player.player_id]
            );

            if (statRows.length > 0) {
                stats[table] = statRows.map((row) => ({
                    name: row.stat_name,
                    value: row.value,
                    position: row.position,
                }));
            }
        }

        //Return structured player data
        return {
            success: true,
            error: null,
            player: {
                nick: player.nick,
                uuid: player.uuid,
                last_online: player.last_online,
                hof: hofScore,
                stats,
            },
        };
    } catch (error) {
        console.error('Error fetching player data:', error);
        return { success: false, error: error.message, player: null };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Get player's data from database by ID
 * Function asynchronously gets player's data (UUID, name and last online date) from the database by UUID
 * @param {string} id - Player's ID
 * @returns {Promise<{
*                      success: boolean,
*                      error: string,
*                      player: Array<{
*                          nick: string,
*                          uuid: string,
*                          last_online: Date,
*                          hof: number,
*                          stats: Array<{stat_name: Array<{name: string, value: number, position: number}>}>
*                      }>
*                  }>
*          }
*/
export async function getPlayerDataByID(playerID) {
    let connection;

    try {
        // Database connection setup
        connection = await dbConnect();

        // Fetch player's basic info (UUID, nickname, last online)
        const [playerRows] = await connection.execute(
            `SELECT id AS player_id, player_uuid AS uuid, player_nick AS nick, player_last_online AS last_online
                FROM uuid_map 
                WHERE id = ? LIMIT 1`,
            [playerID]
        );

        if (playerRows.length === 0) {
            return { success: false, error: 'Player not found', player: null };
        }

        const player = playerRows[0];

        // Step 2: Fetch player's hall of fame score
        const [hofRows] = await connection.execute(
            `SELECT score 
                FROM hall_of_fame 
                WHERE player_id = ? LIMIT 1`,
            [playerID]
        );

        const hofScore = hofRows.length > 0 ? hofRows[0].score : 0;

        // Fetch player's statistics
        const stats = {};
        for (const table of statTables) {
            const [statRows] = await connection.execute(
                `SELECT stat_name, amount AS value, position 
                    FROM ${table} 
                    WHERE player_id = ?
                    ORDER BY position ASC`,
                [player.player_id]
            );

            if (statRows.length > 0) {
                stats[table] = statRows.map((row) => ({
                    name: row.stat_name,
                    value: row.value,
                    position: row.position,
                }));
            }
        }

        // Return structured player data
        return {
            success: true,
            error: null,
            player: {
                nick: player.nick,
                uuid: player.uuid,
                last_online: player.last_online,
                hof: hofScore,
                stats,
            },
        };
    } catch (error) {
        console.error('Error fetching player data:', error);
        return { success: false, error: error.message, player: null };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Get top 15 placers from database
 * Function asynchronously gets top 15 placers from the database (ID, UUID, nick, score)
 * @returns {Promise<{
*                     success: boolean,
*                     error: string,
*                     score: Array<{id: number, uuid: string, nick: string, score: number}>
*                 }>
*         }
*/
export async function getHallOfFameData() {
    let connection;

    try {
        connection = await dbConnect();
        await connection.beginTransaction();

        // SQL query to join `hall_of_fame` and `uuid_map` and fetch top 15 players
        const query = `
            SELECT 
                hof.player_id,
                um.player_uuid AS uuid,
                um.player_nick AS nick,
                hof.score
            FROM hall_of_fame hof
            INNER JOIN uuid_map um ON hof.player_id = um.id
            ORDER BY hof.score DESC
            LIMIT 15
        `;

        const [rows] = await connection.execute(query);

        // Return the result as an array of objects
        return {
            success: true,
            error: null,
            data: rows.map(row => ({
                id: row.player_id,
                uuid: row.uuid,
                nick: row.nick,
                score: row.score,
            })),
        };
    } catch (err) {
        const err_msg = err.message;
        console.error("ERROR (getHallOfFameData):", err);
        return { success: false, error: err_msg, data: null };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Get server data from database
 * Function asynchronously gets server data from the database (Stats last update, server description, url and icon)
 * @returns {Promise<{
*                     success: boolean,
*                     error: string,
*                     data: Array<{last_update: string, desc: string, url: string, icon: base64_string}>
*                   }>
*       }
*/
export async function getServerData() {
    let connection;

    try {
        connection = await dbConnect();
        await connection.beginTransaction();

        // SQL query to fetch server data from `sync_metadata` table
        const query = `
            SELECT
                last_update,
                server_desc,
                server_url,
                server_icon
            FROM sync_metadata
        `;

        const [rows] = await connection.execute(query);

        // Convert Uint8Array to Base64 string
        const buffer = Buffer.from(rows[0].server_icon);
        const iconBase64 = `data:image/png;base64,${buffer.toString("base64")}`;

        // Return the result
        return {
            success: true,
            error: null,
            data: {
                last_update: rows[0].last_update,
                desc: rows[0].server_desc,
                url: rows[0].server_url,
                icon: iconBase64,
            }
        };
    } catch (err) {
        const err_msg = err.message;
        console.error("ERROR (getServerData):", err);
        return { success: false, error: err_msg, data: null };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Get server stats from database
 * Function asynchronously gets server stats from the database (Players overall stats)
 * @returns {Promise<{
*                     success: boolean,
*                     error: string,
*                     data: Array<{
*                                      server_name: string,
*                                      server_url: string,
*                                      stats: Array<{
*                                                      player_count
*                                                      total_play_time: number
*                                                      total_damage_dealt: number
*                                                      total_travelled_distance: number
*                                                      total_broken_tools: number
*                                                      total_crafted_items: number
*                                                      total_mined_blocks: number
*                                                      total_killed_mobs: number
*                                                      total_dropped_items: number
*                                                      total_pickedup_items: number
*                                                   }>
*                                 }>
*                    }>
*          }
*/
export async function getServerStats() {
    let connection;

    try {
        connection = await dbConnect();

        // SQL query to fetch all data at once
        const query = `
            SELECT 
                (SELECT server_name FROM sync_metadata LIMIT 1) AS server_name,
                (SELECT server_url FROM sync_metadata LIMIT 1) AS server_url,
                (SELECT COUNT(*) FROM uuid_map) AS player_count,
                SUM(CASE WHEN stat_name = 'play_time' THEN amount ELSE 0 END) AS total_play_time,
                SUM(CASE WHEN stat_name = 'damage_dealt' THEN amount ELSE 0 END) AS total_damage_dealt,
                (SELECT SUM(amount) FROM \`custom\` 
                    WHERE stat_name IN (
                        'climb_one_cm', 
                        'crouch_one_cm', 
                        'fall_one_cm', 
                        'fly_one_cm', 
                        'sprint_one_cm', 
                        'swim_one_cm', 
                        'walk_one_cm', 
                        'walk_on_water_one_cm', 
                        'walk_under_water_one_cm',
                        'boat_one_cm', 
                        'aviate_one_cm', 
                        'horse_one_cm', 
                        'minecart_one_cm', 
                        'pig_one_cm', 
                        'strider_one_cm'
                    )
                ) AS total_travelled_distance,
                (SELECT SUM(amount) FROM \`broken\`) AS total_broken_tools,
                (SELECT SUM(amount) FROM \`crafted\`) AS total_crafted_items,
                (SELECT SUM(amount) FROM \`mined\`) AS total_mined_blocks,
                (SELECT SUM(amount) FROM \`killed\`) AS total_killed_mobs,
                (SELECT SUM(amount) FROM \`dropped\`) AS total_dropped_items,
                (SELECT SUM(amount) FROM \`picked_up\`) AS total_pickedup_items
            FROM \`custom\`;
        `;

        const [rows] = await connection.execute(query);
        const stats = rows[0] || {};

        // Return structured server stats
        return {
            success: true,
            data: {
                server_name: stats.server_name || "Unknown",
                server_url: stats.server_url || "#",
                stats: {
                    player_count: stats.player_count || 0,
                    total_play_time: stats.total_play_time || 0,
                    total_damage_dealt: stats.total_damage_dealt || 0,
                    total_travelled_distance: stats.total_travelled_distance || 0,
                    total_broken_tools: stats.total_broken_tools || 0,
                    total_crafted_items: stats.total_crafted_items || 0,
                    total_mined_blocks: stats.total_mined_blocks || 0,
                    total_killed_mobs: stats.total_killed_mobs || 0,
                    total_dropped_items: stats.total_dropped_items || 0,
                    total_pickedup_items: stats.total_pickedup_items || 0,
                },
            },
            error: null,
        };
    } catch (err) {
        console.error("ERROR (getServerStats):", err);
        return {
            success: false,
            data: null,
            error: err.message,
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}