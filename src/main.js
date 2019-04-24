'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

const electron = require('electron');
const wpilibNT = require('wpilib-nt-client');
const windowStateKeeper = require('electron-window-state');
const config = require('./config');

const client = new wpilibNT.Client();

// The client will try to reconnect after 1 second
client.setReconnectDelay(1000);

/** Module to control application life. */
const app = electron.app;

/** Module to create native browser window.*/
const BrowserWindow = electron.BrowserWindow;

/** Module for receiving messages from the BrowserWindow */
const ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/**
 * The Main Window of the Program
 * @type {Electron.BrowserWindow}
 * */
let mainWindow;

let connectedFunc,
    ready = false;

let clientDataListener = (key, val, valType, mesgType, id, flags) => {
    if (val === 'true' || val === 'false') {
        val = val === 'true';
    }
    mainWindow.webContents.send(mesgType, {
        key,
        val,
        valType,
        id,
        flags
    });
};

function createWindow() {

    // Attempt to connect to host defined in config
    client.start((con, err) => {

        console.log('NetworkTables connected:', con);

        let connectFunc = () => {
            console.log('Sending connection status to UI process');
            mainWindow.webContents.send('connected', con);
        };

        // If the Window is ready than send the connection status to it
        if (ready) {
            connectFunc();
        }
        connectedFunc = connectFunc;
    }, config.host);

    // When the script starts running in the window set the ready variable
    ipc.on('ready', (ev, mesg) => {
        console.log('Received ready event from UI process');
        ready = mainWindow != null;

        // Remove old Listener
        client.removeListener(clientDataListener);

        // Add new listener with immediate callback
        client.addListener(clientDataListener, true);

        // Send connection message to the window if the message is ready
        if (connectedFunc) connectedFunc();
    });

    // When the user chooses the address of the bot, then try to connect
    ipc.on('connect', (ev, address, port) => {
        console.log(`Trying to connect to ${address}` + (port ? ':' + port : ''));
        let callback = (connected, err) => {
            console.log('Sending status');
            mainWindow.webContents.send('connected', connected);
        };
        if (port) {
            client.start(callback, address, port);
        } else {
            client.start(callback, address);
        }
    });

    ipc.on('add', (ev, mesg) => {
        client.Assign(mesg.val, mesg.key, (mesg.flags & 1) === 1);
    });
    ipc.on('update', (ev, mesg) => {
        client.Update(mesg.id, mesg.val);
    });
    ipc.on('windowError', (ev, error) => {
        console.log(error);
    });

    // Manage saving of the main window's size and position
    const mainWindowState = windowStateKeeper({
        defaultWidth: config.window.defaultWidth,
        defaultHeight: config.window.defaultHeight
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        show: false,
        icon: __dirname + '/../images/icon.png'
    });

    // Save window position and size
    mainWindowState.manage(mainWindow);

    // Load window.
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.setMenu(null);

    mainWindow.once('ready-to-show', () => {
        console.log('Main window is ready to be shown');
        mainWindow.show();
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        console.log('Main window closed');
        mainWindow = null;
        ready = false;
        connectedFunc = null;
        client.removeListener(clientDataListener);
    });
    mainWindow.on('unresponsive', () => {
        console.log('Main window is unresponsive');
    });
    mainWindow.webContents.on('did-fail-load', () => {
        console.log('Window failed load');
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
    console.log('App is ready');
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q.
    // Not like we're creating a consumer application though.
    // Let's just kill it anyway.
    // If you want to restore the standard behavior, uncomment the next line.

    // if (process.platform !== 'darwin')
    app.quit();
});

app.on('quit', function () {
    console.log('Application quit.');
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow == null) createWindow();
});
