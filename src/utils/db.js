'use client';

let dbModule;

// Import database module based on the environment variable (local or remote DB)
if (process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true') {
    dbModule = import('./remoteDB');
} else {
    dbModule = import('./localDB');
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
export const getAllPlayers = async (...args) => {
    const db = await dbModule;
    return db.getAllPlayers(...args);
};

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
export const getPlayerDataByUUID = async (...args) => {
    const db = await dbModule;
    return db.getPlayerDataByUUID(...args);
};

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
export const getPlayerDataByID = async (...args) => {
    const db = await dbModule;
    return db.getPlayerDataByID(...args);
};

/**
 * Get top 15 placers from database
 * Function asynchronously gets top 15 placers from the database (ID, UUID, nick, score)
 * @returns {Promise<{
 *                     success: boolean,
 *                     error: string,
 *                     score: Array<{id: number, uuid: string, nick: string, score: number}>
 *                   }>
 *          }
 */
export const getHallOfFameData = async (...args) => {
    const db = await dbModule;
    return db.getHallOfFameData(...args);
};

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
export const getServerData = async (...args) => {
    const db = await dbModule;
    return db.getServerData(...args);
};

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
export const getServerStats = async (...args) => {
    const db = await dbModule;
    return db.getServerStats(...args);
};

/**
 * Get data for a specific stat from the database
 * Function asynchronously gets data from the database (Rank, Player_nick, Score)
 * @param {string} tableName - Name of the table to query (e.g., "custom").
 * @param {string} statName - Name of the stat to filter by (e.g., "climb_one_cm").
 * @returns {Promise<{
*                     success: boolean,
*                     error: string | null,
*                     data: Array<{rank: number, nick: string, score: number}> | null
*                   }>}
*/
export const getStatData = async (...args) => {
    const db = await dbModule;
    return db.getStatData(...args);
};