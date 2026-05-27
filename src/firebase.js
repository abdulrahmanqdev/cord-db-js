import admin from "firebase-admin";
import { createRequire } from "module";
import { config } from "../config.js";

const require = createRequire(import.meta.url);
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.database
});

const rawDb = admin.database();

const db = {
    /**
     * Set data at a path
     * @param {string} path 
     * @param {any} value 
     */
    async set(path, value) {
        return await rawDb.ref(path).set(value);
    },

    /**
     * Get data from a path
     * @param {string} path 
     */
    async get(path) {
        const snapshot = await rawDb.ref(path).once('value');
        return snapshot.val();
    },

    /**
     * Update data at a path
     * @param {string} path 
     * @param {object} value 
     */
    async update(path, value) {
        return await rawDb.ref(path).update(value);
    },

    /**
     * Delete data at a path
     * @param {string} path 
     */
    async delete(path) {
        return await rawDb.ref(path).remove();
    },

    /**
     * Push data to a path (generates unique ID)
     * @param {string} path 
     * @param {any} value 
     */
    async push(path, value) {
        return await rawDb.ref(path).push(value);
    },

    /**
     * Access raw firebase database if needed
     */
    raw: rawDb
};

export default db;
