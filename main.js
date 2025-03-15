const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron'); // Ensure 'shell' is imported
const path = require('path');
const fs = require('fs');

const userDocuments = app.getPath('documents');
const avoidLauncherFolder = path.join(userDocuments, 'AVoidLauncher');
const dataFile = path.join(avoidLauncherFolder, 'app_data.json');

if (!fs.existsSync(avoidLauncherFolder)) fs.mkdirSync(avoidLauncherFolder, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, 'assets', 'app.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('minimize-window', () => mainWindow?.minimize());
ipcMain.on('close-window', () => mainWindow?.close());

ipcMain.handle('select-app', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('prompt-app-name', async () => {
    return new Promise((resolve) => {
        let inputWindow = new BrowserWindow({
            width: 400,
            height: 200,
            frame: false,
            resizable: false,
            modal: true,
            parent: mainWindow,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        inputWindow.loadFile('input.html');

        ipcMain.once('app-name-entered', (event, name) => {
            resolve(name);
            inputWindow.close();
        });

        inputWindow.on('closed', () => {
            resolve(null);
        });
    });
});

function readAppData() {
    try {
        return fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
    } catch (error) {
        console.error('Failed to read app data:', error);
        return [];
    }
}

function writeAppData(apps) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(apps, null, 2));
    } catch (error) {
        console.error('Failed to write app data:', error);
    }
}

ipcMain.handle('load-apps', () => readAppData());

ipcMain.on('save-app', (event, name, path) => {
    const apps = readAppData();
    if (!apps.some(app => app.path === path)) {
        apps.push({ name, path });
        writeAppData(apps);
        event.sender.send('app-added', { name, path });
    }
});

ipcMain.on('remove-app', (event, appPath) => {
    const apps = readAppData();
    const updatedApps = apps.filter(app => app.path !== appPath);
    writeAppData(updatedApps);
    event.sender.send('app-removed', appPath);
});

ipcMain.on('reset-database', (event) => {
    writeAppData([]);
    event.sender.send('database-reset');
});

ipcMain.on('launch-app', (event, appPath) => {
    shell.openPath(appPath).then(() => {
        console.log(`App launched: ${appPath}`);
    }).catch(err => {
        console.error(`Failed to launch app: ${appPath}`, err);
    });
});

// Add this handler to open the folder containing the EXE file
ipcMain.on('open-exe-folder', (event, appPath) => {
    const folderPath = path.dirname(appPath); // Get the folder containing the EXE file
    shell.showItemInFolder(folderPath); // Open the folder in the file explorer
});