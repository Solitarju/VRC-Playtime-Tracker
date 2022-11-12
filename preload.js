const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('index', {
    log: (str) => ipcRenderer.send('index-log', str),
    close: () => ipcRenderer.send('close'),
    maximize: () => ipcRenderer.send('maximize'),
    minimize: () => ipcRenderer.send('minimize')
});

contextBridge.exposeInMainWorld('BackendContext', {
    loadUser: (callback) => ipcRenderer.on('push-User', callback),
    loadConfig: (config) => ipcRenderer.invoke('index:loadconfig', config),
    uiState: (state) => ipcRenderer.on('ui-state', state)
});

contextBridge.exposeInMainWorld('events', {
    on: (event) => ipcRenderer.on('send-event', event)
})

contextBridge.exposeInMainWorld('functions', {
    trackerToggle: () => ipcRenderer.invoke('tracker:toggle'),
    getPlaytime: (id) => ipcRenderer.invoke('tracker:getPlaytime', id),
    authenticate: (data) => ipcRenderer.invoke('index:authenticate', data),
    logout: () => ipcRenderer.send('logout'),
    updateConfig: (config) => ipcRenderer.invoke('index:updateConfig', config) 
});