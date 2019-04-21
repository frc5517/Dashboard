const ipc = require('electron').ipcRenderer;

let keys = {}, 
    connectionListeners = [], 
    isConnected = false,
    globalListeners = [], 
    keyListeners = {}, 
    robotAddress = '127.0.0.1';

function notifyGlobalListeners(msg) {
    globalListeners.forEach(f => f(msg.key, msg.val, true));
}

function notifyKeyListeners(msg) {
    keyListeners[msg.key].forEach(f => f(msg.key, msg.val, true));
}

ipc.send('ready');
ipc.on('connected', (ev, con) => {
    isConnected = con;
    connectionListeners.forEach(e => e(con));
});
ipc.on('add', (ev, msg) => {
    keys[msg.key] = { val: msg.val, valType: msg.valType, id: msg.id, flags: msg.flags, new: true };
    notifyGlobalListeners(msg);
    if (globalListeners.length > 0)
        keys[msg.key].new = false;
    if (msg.key in keyListeners) {
        notifyKeyListeners(msg);
        keys[msg.key].new = false;
    }
});
ipc.on('delete', (ev, msg) => {
    delete keys[msg.key];
});
ipc.on('update', (ev, msg) => {
    let temp = keys[msg.key];
    temp.flags = msg.flags;
    temp.val = msg.val;
    notifyGlobalListeners(msg);
    if (globalListeners.length > 0)
        keys[msg.key].new = false;
    if (msg.key in keyListeners) {
        notifyKeyListeners(msg);
        temp.new = false;
    }
});
ipc.on('flagChange', (ev, msg) => {
    keys[msg.key].flags = msg.flags;
});

const NetworkTables = {

    /**
     * Sets a function to be called when the robot connects/disconnects to the pynetworktables2js server via NetworkTables. It will also be called when the websocket connects/disconnects.
     *
     * When a listener function is called with a ‘true’ parameter, the NetworkTables.getRobotAddress() function will return a non-null value.
     * @param {(connected: boolean) => any} f a function that will be called with a single boolean parameter that indicates whether the robot is connected
     * @param {boolean} [immediateNotify] If true, the function will be immediately called with the current robot connection state
     */
    addRobotConnectionListener(f, immediateNotify) {
        if(typeof f != 'function') return new Error('Invalid argument')

        connectionListeners.push(f);
        if (immediateNotify)
            f(isConnected);
    },

    /**
     * Set a function that will be called whenever any NetworkTables value is changed
     * @param {(key: string, value: any, isNew: boolean) => any} f When any key changes, this function will be called with the following parameters; key: key name for entry, value: value of entry, isNew: If true, the entry has just been created
     * @param {boolean} [immediateNotify] If true, the function will be immediately called with the current value of all keys
     */
    addGlobalListener(f, immediateNotify) {
        if(typeof f != 'function') return new Error('Invalid argument')

        globalListeners.push(f);
        if (immediateNotify) {
            for (let key in keys) {
                f(key, keys[key].val, keys[key].new);
                keys[key].new = false;
            }
        }
    },

    /**
     * Set a function that will be called whenever a value for a particular key is changed in NetworkTables
     * @param {string} key A networktables key to listen for
     * @param {(key: string, value: any, isNew: boolean) => any} f When the key changes, this function will be called with the following parameters; key: key name for entry, value: value of entry, isNew: If true, the entry has just been created
     * @param {boolean} [immediateNotify] If true, the function will be immediately called with the current value of the specified key
     */
    addKeyListener(key, f, immediateNotify) {
        if(typeof key != 'string' || typeof f != 'function') return new Error('Valid Arguments are (string, function)')

        if (typeof keyListeners[key] != 'undefined') {
            keyListeners[key].push(f);
        }
        else {
            keyListeners[key] = [f];
        }
        if (immediateNotify && key in keys) {
            let temp = keys[key];
            f(key, temp.val, temp.new);
        }
    },

    /**
     * Use this to test whether a value is present in the table or not
     * @param {string} key A networktables key
     * @returns true if a key is present in NetworkTables, false otherwise
     */
    containsKey(key) {
        if(typeof f != 'string') return false
        return key in keys;
    },

    /**
     * Get all keys in the NetworkTables
     * @returns all the keys in the NetworkTables
     */
    getKeys() {
        return Object.keys(keys);
    },

    /**
     * Returns the value that the key maps to. If the websocket is not open, this will always return the default value specified.
     * @param {string} key A networktables key
     * @param {any} [defaultValue] If the key isn’t present in the table, return this instead
     * @returns value of key if present, undefined or defaultValue otherwise
     */
    getValue(key, defaultValue) {
        if(typeof key != 'string') return new Error('Invalid Argument')

        if (typeof keys[key] != 'undefined') {
            return keys[key].val;
        }
        else {
            return defaultValue;
        }
    },

    /**
     * @returns null if the robot is not connected, or a string otherwise
     */
    getRobotAddress() {
        return isConnected ? robotAddress : null;
    },

    /**
     * @returns true if the robot is connected
     */
    isRobotConnected() {
        return isConnected;
    },

    /**
     * Sets the value in NetworkTables. If the websocket is not connected, the value will be discarded.
     * @param {string} key A networktables key
     * @param value The value to set (see warnings)
     * @returns True if the websocket is open, False otherwise
     */
    putValue(key, value) {
        if(typeof key != 'string') return new Error('Invalid Argument')

        if (typeof keys[key] != 'undefined') {
            keys[key].val = value;
            ipc.send('update', { key, val: value, id: keys[key].id, flags: keys[key].flags });
        }
        else {
            ipc.send('add', { key, val: value, flags: 0 });
        }
        return isConnected;
    },

    /**
     * Escapes NetworkTables keys so that they’re valid HTML identifiers.
     * @param key A networktables key
     * @returns Escaped value
     */
    keyToId: encodeURIComponent,

    /**
     * Escapes special characters and returns a valid jQuery selector. Useful as NetworkTables does not really put any limits on what keys can be used.
     * @param {string} key A networktables key
     * @returns Escaped value
     */
    keySelector(key) {
        return encodeURIComponent(key).replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
    }
};

module.exports = NetworkTables;
