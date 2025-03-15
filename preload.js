const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    selectApp: () => ipcRenderer.invoke('select-app').catch(err => {
        console.error('Failed to select app:', err);
        return null;
    }),
    promptForAppName: () => ipcRenderer.invoke('prompt-app-name').catch(err => {
        console.error('Failed to prompt for app name:', err);
        return null;
    }),
    saveApp: (name, path) => ipcRenderer.send('save-app', name, path),
    loadApps: () => ipcRenderer.invoke('load-apps').catch(err => {
        console.error('Failed to load apps:', err);
        return [];
    }),
    removeApp: (appPath) => ipcRenderer.send('remove-app', appPath),
    resetDatabase: () => ipcRenderer.send('reset-database'),
    launchApp: (appPath) => ipcRenderer.send('launch-app', appPath),
    openExeFolder: (appPath) => ipcRenderer.send('open-exe-folder', appPath), // Add this line
});