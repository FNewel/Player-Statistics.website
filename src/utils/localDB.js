'use client'

import initSqlJs from "sql.js";


const DB_UPDATE_INTERVAL = 1  // 1 hour
const statTables = ['broken', 'crafted', 'custom', 'dropped', 'killed', 'killed_by', 'mined', 'picked_up', 'used'];



/**
 * Initialize IndexedDB
 * Function asynchronously initializes the IndexedDB and creates the object store if it doesn't exist
 *
 * @returns {Promise<IDBDatabase>} - IndexedDB database object
 */
async function initializeIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PlayerStatisticsDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("database")) {
        db.createObjectStore("database");
        console.log("ObjectStore 'database' created successfully.");
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("Error initializing IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save database to IndexedDB
 * Function asynchronously saves the database to IndexedDB with a timestamp
 * or (creates/) updates the database if it (not) already exists
 *
 * @param {Uint8Array} binaryArray - Binary array of the database
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function saveDatabaseToIndexedDB(binaryArray) {
  const db = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("database", "readwrite");
    const store = transaction.objectStore("database");

    const timestamp = Date.now();

    const putRequest = store.put({ db: binaryArray, timestamp }, "cachedDatabase");

    putRequest.onsuccess = () => {
      console.log("Database and timestamp saved successfully.");
      resolve(true);
    };

    putRequest.onerror = (event) => {
      console.error("Error saving database:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Load database from IndexedDB
 * Function asynchronously loads the database from IndexedDB and returns it
 *
 * @returns {Promise<Object | null>} - Database object or null if not found
 */
async function loadDatabaseFromIndexedDB() {
  const db = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("database", "readonly");
    const store = transaction.objectStore("database");

    const getRequest = store.get("cachedDatabase");

    getRequest.onsuccess = (event) => {
      const result = getRequest.result;
      if (result) {
        console.log("Database and timestamp loaded successfully.");
        resolve(result);
      } else {
        console.warn("No database found in IndexedDB.");
        resolve(null);
      }
    };

    getRequest.onerror = (event) => {
      console.error("Error loading database:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Load database from IndexedDB or fetch from server
 * Function asynchronously loads the database from IndexedDB or fetches it from the server if it's not available or too old
 * 
 * @returns {Promise<SQL.Database>} - Database object
 * @throws {Error} - If there is an error loading the database
 */
async function loadDatabase() {

  // Check if window is defined
  if (typeof window === 'undefined') {
    return null;
  }

  // Initialize SQL.js
  const sqlPromise = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`,
  });

  // Get SQL.js instance
  const SQL = sqlPromise;

  // Load database from IndexedDB
  const result = await loadDatabaseFromIndexedDB();
  if (result) {
    const { db: binaryArray, timestamp } = result;

    const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (ageInHours < DB_UPDATE_INTERVAL) {
      console.log(`Using cached database. Age: ${ageInHours.toFixed(2)} hours.`);
      return new SQL.Database(new Uint8Array(binaryArray));
    }

    console.log(`Cached database is too old (Age: ${ageInHours.toFixed(2)} hours). Refreshing...`);
  } else {
    console.log("No cached database found. Downloading new database...");
  }

  // If no database in IndexedDB or it's too old, fetch new database from server
  const response = await fetch("/player-statistics.db");
  if (!response.ok) {
    throw new Error("Failed to fetch database from server.");
  }
  const data = await response.arrayBuffer();

  const db = new SQL.Database(new Uint8Array(data));

  // Save new database to IndexedDB
  const binaryArray = db.export();
  await saveDatabaseToIndexedDB(binaryArray);

  return db;
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
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", players: null };

    const result = db.exec("SELECT * FROM uuid_map");

    const players = result[0]?.values.map(([id, uuid, nick, last_online]) => ({
      id,
      uuid,
      nick,
      last_online: new Date(Number(last_online)),
    }));

    return { success: true, players: players || [] };
  } catch (error) {
    console.error("Error loading players:", error);
    return { success: false, error: error.message };
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
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", player: null };

    const playerStmt = db.prepare(`
      SELECT id AS player_id, player_uuid AS uuid, player_nick AS nick, player_last_online AS last_online
      FROM uuid_map
      WHERE player_uuid = ? LIMIT 1
    `);
    playerStmt.bind([UUID]);

    let player = null;
    if (playerStmt.step()) {
      const row = playerStmt.getAsObject();
      player = {
        player_id: row.player_id,
        uuid: row.uuid,
        nick: row.nick,
        last_online: new Date(Number(row.last_online)),
      };
    }
    playerStmt.free();

    if (!player) {
      return { success: false, error: "Player not found", player: null };
    }

    const hofStmt = db.prepare(`
      SELECT score
      FROM hall_of_fame
      WHERE player_id = ? LIMIT 1
    `);
    hofStmt.bind([player.player_id]);

    let hofScore = 0;
    if (hofStmt.step()) {
      hofScore = hofStmt.getAsObject().score;
    }
    hofStmt.free();

    const stats = {};

    for (const table of statTables) {
      const statStmt = db.prepare(`
        SELECT stat_name, amount AS value, position
        FROM ${table}
        WHERE player_id = ?
        ORDER BY position ASC
      `);
      statStmt.bind([player.player_id]);

      const tableStats = [];
      while (statStmt.step()) {
        const statRow = statStmt.getAsObject();
        tableStats.push({
          name: statRow.stat_name,
          value: statRow.value,
          position: statRow.position,
        });
      }
      statStmt.free();

      if (tableStats.length > 0) {
        stats[table] = tableStats;
      }
    }

    return {
      success: true,
      error: null,
      player: {
        nick: player.nick,
        uuid: player.uuid,
        last_online: new Date(Number(player.last_online)),
        hof: hofScore,
        stats,
      },
    };
  } catch (error) {
    console.error("Error fetching player data:", error);
    return { success: false, error: error.message, player: null };
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
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", player: null };

    const playerStmt = db.prepare(`
      SELECT id AS player_id, player_uuid AS uuid, player_nick AS nick, player_last_online AS last_online
      FROM uuid_map
      WHERE id = ? LIMIT 1
    `);
    playerStmt.bind([playerID]);

    let player = null;
    if (playerStmt.step()) {
      const row = playerStmt.getAsObject();
      player = {
        player_id: row.player_id,
        uuid: row.uuid,
        nick: row.nick,
        last_online: new Date(Number(row.last_online)),
      };
    }
    playerStmt.free();

    if (!player) {
      return { success: false, error: "Player not found", player: null };
    }

    const hofStmt = db.prepare(`
      SELECT score
      FROM hall_of_fame
      WHERE player_id = ? LIMIT 1
    `);
    hofStmt.bind([player.player_id]);

    let hofScore = 0;
    if (hofStmt.step()) {
      hofScore = hofStmt.getAsObject().score;
    }
    hofStmt.free();

    const stats = {};

    for (const table of statTables) {
      const statStmt = db.prepare(`
        SELECT stat_name, amount AS value, position
        FROM ${table}
        WHERE player_id = ?
        ORDER BY position ASC
      `);
      statStmt.bind([player.player_id]);

      const tableStats = [];
      while (statStmt.step()) {
        const statRow = statStmt.getAsObject();
        tableStats.push({
          name: statRow.stat_name,
          value: statRow.value,
          position: statRow.position,
        });
      }
      statStmt.free();

      if (tableStats.length > 0) {
        stats[table] = tableStats;
      }
    }

    return {
      success: true,
      error: null,
      player: {
        nick: player.nick,
        uuid: player.uuid,
        last_online: new Date(Number(player.last_online)),
        hof: hofScore,
        stats,
      },
    };
  } catch (error) {
    console.error("Error fetching player data:", error);
    return { success: false, error: error.message, player: null };
  }
}

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
export async function getHallOfFameData() {
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", data: null };

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

    const stmt = db.prepare(query);

    const hallOfFame = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      hallOfFame.push({
        id: row.player_id,
        uuid: row.uuid,
        nick: row.nick,
        score: row.score,
      });
    }
    stmt.free();

    return {
      success: true,
      error: null,
      data: hallOfFame,
    };
  } catch (err) {
    console.error("ERROR (getHallOfFameData):", err);
    return { success: false, error: err.message, data: null };
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
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", data: null };

    const query = `
      SELECT
        last_update,
        server_desc,
        server_url,
        server_icon
      FROM sync_metadata
      LIMIT 1
    `;

    const stmt = db.prepare(query);

    let serverData = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();

      const iconBase64 = row.server_icon
        ? `data:image/png;base64,${btoa(
          String.fromCharCode(...new Uint8Array(row.server_icon))
        )}`
        : "/assets/server_missing_img.webp";

      const desc = row.server_desc ? row.server_desc : "§cPowered by§r\n§a§lPlayer statistics §7§8(no motd found)";
      const url = row.server_url ? row.server_url : "https://modrinth.com/mod/player-statistics";

      serverData = {
        last_update: new Date(row.last_update),
        desc: desc,
        url: url,
        icon: iconBase64,
      };
    }
    stmt.free();

    if (!serverData) {
      return { success: false, error: "No server data found", data: null };
    }

    return {
      success: true,
      error: null,
      data: serverData,
    };
  } catch (err) {
    console.error("ERROR (getServerData):", err);
    return { success: false, error: err.message, data: null };
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
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", data: null };

    const query = `
      SELECT 
        (SELECT server_name FROM sync_metadata LIMIT 1) AS server_name,
        (SELECT server_url FROM sync_metadata LIMIT 1) AS server_url,
        (SELECT COUNT(*) FROM uuid_map) AS player_count,
        SUM(CASE WHEN stat_name = 'play_time' THEN amount ELSE 0 END) AS total_play_time,
        SUM(CASE WHEN stat_name = 'damage_dealt' THEN amount ELSE 0 END) AS total_damage_dealt,
        (SELECT SUM(amount) FROM custom 
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
        (SELECT SUM(amount) FROM broken) AS total_broken_tools,
        (SELECT SUM(amount) FROM crafted) AS total_crafted_items,
        (SELECT SUM(amount) FROM mined) AS total_mined_blocks,
        (SELECT SUM(amount) FROM killed) AS total_killed_mobs,
        (SELECT SUM(amount) FROM dropped) AS total_dropped_items,
        (SELECT SUM(amount) FROM picked_up) AS total_pickedup_items
      FROM custom;
    `;

    const stmt = db.prepare(query);

    let stats = {};
    if (stmt.step()) {
      stats = stmt.getAsObject();
    }
    stmt.free();

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
  }
}

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
export async function getStatData(tableName, statName) {
  try {
    const db = await loadDatabase();
    if (!db) return { success: false, error: "Database not loaded", data: null };

    const query = `
     SELECT 
       c.position AS rank,
       u.id AS Player_id,
       u.player_uuid AS Player_uuid,
       u.player_nick AS nick,
       c.amount AS score
     FROM ${tableName} c
     INNER JOIN uuid_map u ON c.player_id = u.id
     WHERE c.stat_name = ?
     ORDER BY Score DESC
   `;

    const stmt = db.prepare(query);
    stmt.bind([statName]);

    const resultData = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      resultData.push({
        rank: row.rank,
        player_id: row.Player_id,
        player_uuid: row.Player_uuid,
        player_nick: row.nick,
        score: row.score,
      });
    }
    stmt.free();

    return {
      success: true,
      error: null,
      data: resultData,
    };
  } catch (err) {
    console.error("ERROR (getStatData):", err);
    return { success: false, error: err.message, data: null };
  }
}
