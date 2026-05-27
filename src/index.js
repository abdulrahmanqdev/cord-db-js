import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function getCallerDirectory() {
  const originalPrepare = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack;
  Error.prepareStackTrace = originalPrepare;

  if (stack && stack.length > 0) {
    for (const frame of stack) {
      const fileName = frame.getFileName();
      if (fileName && 
          !fileName.includes('node_modules/cord-db-js') && 
          !fileName.includes('node:internal') &&
          !fileName.includes('index.js')) {
        
        let finalPath = fileName;
        if (finalPath.startsWith("file://")) {
          finalPath = fileURLToPath(finalPath);
        }
        return path.dirname(finalPath);
      }
    }
  }
  return process.cwd();
}

export class CordDB {
  constructor(config) {
    if (!config.databaseURL) {
      throw new Error("CordDB: databaseURL is required in config.");
    }
    if (!config.serviceAccount) {
      throw new Error("CordDB: serviceAccount is required in config.");
    }

    let credential;

    if (typeof config.serviceAccount === "string") {
      let resolvedPath = config.serviceAccount;
      if (!path.isAbsolute(resolvedPath)) {
        const callerDir = getCallerDirectory();
        resolvedPath = path.resolve(callerDir, resolvedPath);
      }
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`CordDB: Service account file not found at ${resolvedPath}`);
      }
      credential = admin.credential.cert(resolvedPath);
    } else {
      credential = admin.credential.cert(config.serviceAccount);
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: credential,
        databaseURL: config.databaseURL
      });
    }

    this.db = admin.database();
  }

    /**
     * Veritabanına veri kaydeder.
     * @param {string} key - Anahtar
     * @param {any} value - Değer
     * @returns {Promise<void>}
     */
    async set(key, value) {
        await this.db.ref(key).set(value);
    }

    /**
     * Veritabanından veri çeker.
     * @param {string} key - Anahtar
     * @returns {Promise<any>}
     */
    async get(key) {
        const snapshot = await this.db.ref(key).once("value");
        return snapshot.val();
    }

    /**
     * Veritabanından veri çeker (get ile aynıdır).
     * @param {string} key - Anahtar
     * @returns {Promise<any>}
     */
    async fetch(key) {
        return this.get(key);
    }

    /**
     * Veritabanından veri siler.
     * @param {string} key - Anahtar
     * @returns {Promise<void>}
     */
    async delete(key) {
        await this.db.ref(key).remove();
    }

    /**
     * Anahtarın olup olmadığını kontrol eder.
     * @param {string} key - Anahtar
     * @returns {Promise<boolean>}
     */
    async has(key) {
        const data = await this.get(key);
        return data !== null;
    }

    /**
     * Tüm verileri çeker.
     * @returns {Promise<any>}
     */
    async all() {
        const snapshot = await this.db.ref("/").once("value");
        return snapshot.val() || {};
    }

    /**
     * Bir diziye veri ekler.
     * @param {string} key - Anahtar
     * @param {any} value - Eklenecek değer
     * @returns {Promise<void>}
     */
    async push(key, value) {
        await this.db.ref(key).push(value);
    }

    /**
     * Sayısal bir değeri artırır.
     * @param {string} key - Anahtar
     * @param {number} [value=1] - Artış miktarı
     * @returns {Promise<void>}
     */
    async add(key, value = 1) {
        await this.db.ref(key).transaction((currentValue) => {
            return (currentValue || 0) + value;
        });
    }

    /**
     * Sayısal bir değeri azaltır.
     * @param {string} key - Anahtar
     * @param {number} [value=1] - Azalış miktarı
     * @returns {Promise<void>}
     */
    async subtract(key, value = 1) {
        await this.db.ref(key).transaction((currentValue) => {
            return (currentValue || 0) - value;
        });
    }

    /**
     * Veritabanındaki veriyi günceller.
     * @param {string} key - Anahtar
     * @param {Object} value - Yeni değerler
     * @returns {Promise<void>}
     */
    async update(key, value) {
        await this.db.ref(key).update(value);
    }

    /**
     * Tüm veritabanını temizler.
     * @returns {Promise<void>}
     */
    async clear() {
        await this.db.ref("/").remove();
    }
}

export default CordDB;
