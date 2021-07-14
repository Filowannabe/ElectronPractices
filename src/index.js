const { BrowserWindow } = require('electron');
const { app } = require('electron');
const periodService = require('./services/PeriodService');
require('./config/Database');
require('electron-reload')(__dirname);
const dialog = require('electron').dialog;


const { ipcMain } = require('electron');

ipcMain.on('create', async (event, args) => {
    const periods = await periodService.createPeriod(args.dateIn, args.timeIn, args.timeOut, args.description);
    event.reply("replyCreate", periods);
});
ipcMain.on('getAll', async (event, args) => {
    const periods = await periodService.getAllPeriods();
    event.reply("replyGet", periods);
});

ipcMain.on('getPeriod', async (event, args) => {
    event.reply("replyperiod", args);
});
ipcMain.on('open', function (event) {
    dialog.showOpenDialog({
        properties: ["openDirectory"],
        defaultPath: app.getPath("desktop")
    }).then((path) => {
        if (path.canceled) {
        } else {
            event.reply("selectedPath", path.filePaths[0]);
        }
    });
})


const home = 'index.html';
let window;
function createWindow() {
    window = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.removeMenu();
    window.loadFile(`src/controllers/${home}`);
}

app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow);

module.exports = {
    createWindow
}
