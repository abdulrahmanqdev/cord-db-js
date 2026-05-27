import admin from "firebase-admin";
import fs from "fs";
import path from "path";

/**
 * @typedef {Object} CordDBConfig
 * @property {string} databaseURL - Firebase Realtime Database URL
 * @property {Object|string} serviceAccount - Service Account Key object or path to JSON file
 */

export class CordDB {
  /**
   * @param {CordDBConfig} config 
   */
  constructor(config) {
    if (!config.databaseURL) {
      throw new Error("CordDB: databaseURL is required in config.");
    }
    if (!config.serviceAccount) {
      throw new Error("CordDB: serviceAccount is required in config.");
    }

    let credential;

    // Eğer string ise dosya yolu olarak kabul et ve oku
    if (typeof config.serviceAccount === "string") {
      const resolvedPath = path.resolve(config.serviceAccount);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`CordDB: Service account file not found at ${resolvedPath}`);
      }
      credential = admin.credential.cert(resolvedPath);
    } else {
            // Değilse direkt obje olarak kabul et
            credential = admin.credential.cert(config.serviceAccount);
        }

        // Initialize Firebase Admin
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
