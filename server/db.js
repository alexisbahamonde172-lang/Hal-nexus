const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hal_nexus_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let dbConnected = false;
let lastDbError = null;

/**
 * Inicializa y migra automáticamente el esquema relacional hal_nexus_db en MariaDB local.
 */
async function initDB() {
  try {
    const bootstrapConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await bootstrapConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await bootstrapConnection.end();

    pool = mysql.createPool(DB_CONFIG);

    // 1. Crear tabla dispositivos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dispositivos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_hw VARCHAR(128) NOT NULL UNIQUE,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(32) NOT NULL,
        bus_info VARCHAR(255) DEFAULT NULL,
        voltaje_vbus DECIMAL(5,2) DEFAULT NULL,
        latencia_ms DECIMAL(7,2) DEFAULT NULL,
        perdida_paquetes DECIMAL(5,2) DEFAULT 0.00,
        specs_json LONGTEXT DEFAULT NULL,
        estado ENUM('ESTABLE', 'ADVERTENCIA', 'CRITICO') NOT NULL DEFAULT 'ESTABLE',
        ultima_deteccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Migraciones idempotentes en MariaDB para asegurar todas las columnas en `dispositivos`
    const deviceMigrations = [
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS codigo_hw VARCHAR(128) DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS nombre VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS tipo VARCHAR(32) DEFAULT 'USB'`,
      `ALTER TABLE dispositivos MODIFY COLUMN bus_info VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS voltaje_vbus DECIMAL(5,2) DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS latencia_ms DECIMAL(7,2) DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS perdida_paquetes DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS specs_json LONGTEXT DEFAULT NULL`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS estado ENUM('ESTABLE', 'ADVERTENCIA', 'CRITICO') NOT NULL DEFAULT 'ESTABLE'`,
      `ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS ultima_deteccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE dispositivos ADD UNIQUE INDEX IF NOT EXISTS idx_unique_codigo_hw (codigo_hw)`
    ];

    for (const sql of deviceMigrations) {
      await pool.query(sql).catch(() => {});
    }

    // Limpiar antiguos dispositivos sintéticos o desconectados de prueba si existían en la base de datos
    await pool
      .query(
        `DELETE FROM dispositivos WHERE codigo_hw IN ('STORAGE-nvme1n1', 'STORAGE-sda', 'STORAGE-sdb', 'USB-FLASH-01', 'GAMEPAD-KROM-KLOUD')`
      )
      .catch(() => {});

    // 2. Crear tabla logs_diagnostico si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs_diagnostico (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        dispositivo_id INT DEFAULT NULL,
        codigo_error VARCHAR(64) NOT NULL,
        severidad ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO',
        mensaje TEXT NOT NULL,
        metrica_valor VARCHAR(128) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Migraciones idempotentes en MariaDB para asegurar todas las columnas en `logs_diagnostico`
    const logMigrations = [
      `ALTER TABLE logs_diagnostico ADD COLUMN IF NOT EXISTS codigo_error VARCHAR(64) DEFAULT 'SYS_EVENT'`,
      `ALTER TABLE logs_diagnostico ADD COLUMN IF NOT EXISTS severidad ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO'`,
      `ALTER TABLE logs_diagnostico ADD COLUMN IF NOT EXISTS mensaje TEXT DEFAULT NULL`,
      `ALTER TABLE logs_diagnostico ADD COLUMN IF NOT EXISTS metrica_valor VARCHAR(128) DEFAULT NULL`,
      `ALTER TABLE logs_diagnostico ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    ];

    for (const sql of logMigrations) {
      await pool.query(sql).catch(() => {});
    }

    dbConnected = true;
    lastDbError = null;
    console.log(
      `[MariaDB] Esquema '${DB_CONFIG.database}' verificado y activo en ${DB_CONFIG.host}:${DB_CONFIG.port}`
    );
    return true;
  } catch (error) {
    dbConnected = false;
    lastDbError = error.message;
    console.warn(`[MariaDB] Advertencia de conexión (${DB_CONFIG.host}:${DB_CONFIG.port}): ${error.message}`);
    console.warn('[MariaDB] HAL-Nexus operará con buffer en memoria hasta que MariaDB esté disponible.');
    return false;
  }
}

/**
 * Inserta o actualiza un dispositivo detectado en la tabla `dispositivos`.
 */
async function upsertDispositivo(device) {
  if (!dbConnected || !pool) return null;

  try {
    const {
      codigo_hw,
      nombre,
      tipo,
      bus_info = null,
      voltaje_vbus = null,
      latencia_ms = null,
      perdida_paquetes = 0,
      specs_json = null,
      estado = 'ESTABLE'
    } = device;

    const serializedSpecs =
      specs_json && typeof specs_json === 'object'
        ? JSON.stringify(specs_json)
        : typeof specs_json === 'string'
        ? specs_json
        : null;

    const sql = `
      INSERT INTO dispositivos
        (codigo_hw, nombre, tipo, bus_info, voltaje_vbus, latencia_ms, perdida_paquetes, specs_json, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        tipo = VALUES(tipo),
        bus_info = VALUES(bus_info),
        voltaje_vbus = VALUES(voltaje_vbus),
        latencia_ms = VALUES(latencia_ms),
        perdida_paquetes = VALUES(perdida_paquetes),
        specs_json = COALESCE(VALUES(specs_json), specs_json),
        estado = VALUES(estado),
        ultima_deteccion = CURRENT_TIMESTAMP;
    `;

    await pool.execute(sql, [
      codigo_hw,
      String(nombre || '').slice(0, 250),
      String(tipo || 'USB').slice(0, 32),
      bus_info ? String(bus_info).slice(0, 250) : null,
      voltaje_vbus,
      latencia_ms,
      perdida_paquetes,
      serializedSpecs,
      estado
    ]);

    const [rows] = await pool.execute(
      'SELECT id FROM dispositivos WHERE codigo_hw = ? LIMIT 1',
      [codigo_hw]
    );
    lastDbError = null;
    return rows.length > 0 ? rows[0].id : null;
  } catch (error) {
    lastDbError = error.message;
    return null;
  }
}

/**
 * Elimina de la tabla `dispositivos` los periféricos externos desconectados para mantener
 * sincronía estricta con Hot-Plug en tiempo real (preservando el historial en logs_diagnostico).
 */
async function depurarDispositivosDesconectados(activeCodigosHw = []) {
  if (!dbConnected || !pool) return;
  try {
    const validCodes = Array.isArray(activeCodigosHw) ? activeCodigosHw.filter(Boolean) : [];
    if (validCodes.length === 0) return;

    const placeholders = validCodes.map(() => '?').join(', ');
    await pool.execute(
      `DELETE FROM dispositivos WHERE codigo_hw NOT IN (${placeholders})`,
      validCodes
    );
  } catch (error) {
    lastDbError = error.message;
  }
}

/**
 * Registra un evento en la tabla `logs_diagnostico` vinculado opcionalmente a un dispositivo.
 */
async function registrarLog({
  codigo_hw = null,
  codigo_error = 'SYS_EVENT',
  severidad = 'INFO',
  mensaje,
  metrica_valor = null
}) {
  if (!dbConnected || !pool) return null;

  try {
    let dispositivoId = null;

    if (codigo_hw) {
      const [devRows] = await pool.execute(
        'SELECT id FROM dispositivos WHERE codigo_hw = ? LIMIT 1',
        [codigo_hw]
      );
      if (devRows.length > 0) {
        dispositivoId = devRows[0].id;
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO logs_diagnostico
        (dispositivo_id, codigo_error, severidad, mensaje, metrica_valor)
       VALUES (?, ?, ?, ?, ?)`,
      [dispositivoId, codigo_error, severidad, mensaje, metrica_valor]
    );

    lastDbError = null;
    return result.insertId;
  } catch (error) {
    lastDbError = error.message;
    return null;
  }
}

/**
 * Obtiene los últimos registros de diagnóstico con JOIN a la tabla `dispositivos`.
 */
async function obtenerUltimosLogs(limite = 40) {
  if (!dbConnected || !pool) return [];

  try {
    const safeLimit = Math.max(1, Math.min(200, Number(limite) || 40));
    const [rows] = await pool.query(
      `SELECT
         l.id,
         l.codigo_error,
         l.severidad,
         COALESCE(l.mensaje, '') AS mensaje,
         l.metrica_valor,
         l.created_at,
         d.codigo_hw,
         d.nombre AS dispositivo_nombre,
         d.tipo AS dispositivo_tipo
       FROM logs_diagnostico l
       LEFT JOIN dispositivos d ON l.dispositivo_id = d.id
       ORDER BY l.id DESC
       LIMIT ${safeLimit}`
    );
    lastDbError = null;
    return rows;
  } catch (error) {
    lastDbError = error.message;
    return [];
  }
}

/**
 * Obtiene todos los dispositivos registrados en `hal_nexus_db`.
 */
async function obtenerDispositivosDB() {
  if (!dbConnected || !pool) return [];

  try {
    const [rows] = await pool.query(
      'SELECT * FROM dispositivos WHERE codigo_hw IS NOT NULL ORDER BY tipo ASC, codigo_hw ASC'
    );
    lastDbError = null;
    return rows;
  } catch (error) {
    lastDbError = error.message;
    return [];
  }
}

function getDBStatus() {
  return {
    connected: dbConnected,
    database: DB_CONFIG.database,
    host: `${DB_CONFIG.host}:${DB_CONFIG.port}`,
    error: lastDbError
  };
}

module.exports = {
  initDB,
  upsertDispositivo,
  depurarDispositivosDesconectados,
  registrarLog,
  obtenerUltimosLogs,
  obtenerDispositivosDB,
  getDBStatus
};
