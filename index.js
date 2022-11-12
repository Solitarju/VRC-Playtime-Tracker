const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require('electron');
const { Menu, MenuItem } = require('electron/main');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const tracker = require('./trackerModule.js');

var uid;
var token;

var userJson;

const devMode = false;
const appdir = devMode === true ? __dirname : app.getPath('userData');

const def_configSettings = { systemStartup: false, minimizeToTray: true, rememberLogin: false, trackFriends: true, notifications: { type: 'blacklist', wl: [], bl: [] } };

const loadConfig = async () => {

    if(!fs.existsSync(path.join(appdir, '/config.json'))) {

        fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify({ id: false, token: false, settings: def_configSettings }));
        return { auth: false, settings: def_configSettings };
    }

    const config = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'), 'utf-8'));
    if(config.settings.rememberLogin === true && config.token && config.id) {

        if(token) return JSON.stringify({ auth: false, settings: config.settings });

        const auth = {
            id: config.id,
            token: config.token
        }

        const res = await authenticate(auth, true);
        return JSON.stringify({ auth: res, settings: config.settings });
    }

    return JSON.stringify({ auth: false, settings: config.settings });
}

const authenticate = async (authArgs, rememberLogin) => {

    const fromConfig = authArgs.token ? true : false;

    if(fromConfig) {

        const id = authArgs.id;
        const _token = authArgs.token;

        const User = await fetch(`https://vrchat.com/api/1/users/${id}`, { method: 'get', headers: { "cookie": `apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26; ${_token};`, "referer": `https://vrchat.com/home/user/${id}`, "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' } })
        .then((res) => { return res; });

        if(!User.ok) {

            console.log('A problem occurred during authentication. (Probably an invalid session token)');

            return false;
        }

        token = _token;
        uid = id;
        wsurl = `wss://vrchat.com/?authToken=${_token.slice(_token.indexOf('=')+1)}`;
        userJson = await User.json();

        console.log('true auth');
        return true;
    }

    const auth = {
        username: authArgs.username,
        password: authArgs.password
    };

    const base64 = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    const authorization = `BASIC ${base64}`;

    const login = await fetch('https://vrchat.com/api/1/auth/user', { method: 'get', headers: { "authorization": authorization, "referer": "https://vrchat.com/home/login", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" } })
    .then((res) => { return res });

    if(!login.ok) {

        return false;
    }

    const json = await login.json();

    userJson = await json;
    token = login.headers.get('set-cookie').split(';')[0];
    uid = await json.id;
    wsurl = `wss://vrchat.com/?authToken=${token.slice(token.indexOf('=')+1)}`;

    if(rememberLogin) {

        const configJson = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json')));
        fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify({ id: await json.id, token: login.headers.get('set-cookie').split(';')[0], settings: configJson.settings }));
    }

    console.log('true auth');
    return true;
};

const appWindow = async () => {
    const icopath = path.join(__dirname, 'assets/icon.png');
    const winMain = new BrowserWindow({
        width: 800,
        height: 600,
        center: true,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        icon: nativeImage.createFromPath(icopath),
    });

    const tray = new Tray(nativeImage.createFromPath(icopath));

    const menu = Menu.buildFromTemplate([
        new MenuItem({
            label: `Show Window`,
            type: 'normal',
            click: () => {
                    winMain.maximize();
            }
        }),
        new MenuItem({
            label: 'Exit',
            type: 'normal',
            click: () => {
                app.exit();
            }
        })
    ]);

    tray.setContextMenu(menu);

    tray.addListener('click', () => {
            winMain.maximize();
    });

    var starting;
    var tracking;

    tracker.events.on('Initialized', () => {
        console.log('event: Initialized');
    });

    tracker.events.on('tracker-start', () => {
        winMain.webContents.send('send-event', 'tracker-start');
    });

    tracker.events.on('ws-connected', () => {
        winMain.webContents.send('send-event', 'ws-connected');
    });

    tracker.events.on('ws-disconnected', () => {
        winMain.webContents.send('send-event', 'ws-disconnected');
    });

    tracker.events.on('ws-update', () => {
        winMain.webContents.send('send-event', 'ws-update');
    });

    tracker.events.on('tracker-stop', () => {
        winMain.webContents.send('send-event', 'tracker-stop');
    });

    tracker.events.on('user-online', () => {
        winMain.webContents.send('send-event', 'user-online');
    });

    tracker.events.on('user-offline', () => {
        winMain.webContents.send('send-event', 'user-offline');
    });

    winMain.on('close', function (event) {
        event.preventDefault();
        if(!app.isQuiting){
            const config = JSON.parse(fs.readFileSync(path.join(appdir, './config.json'), 'utf-8'));
            if(config.settings.minimizeToTray !== false) {

                event.preventDefault();
                winMain.hide();

                return;
            }

            app.quit();
        }
    
        return;
    });

    ipcMain.on('index-log', (event, str) => {
        console.log(str);
    });

    ipcMain.on('close', () => {
        winMain.close();
    });

    ipcMain.on('maximize', () => {
        if(!winMain.isMaximized()) {

            winMain.maximize();
            return;
        }

        winMain.restore();
    });

    ipcMain.on('minimize', () => {
        winMain.minimize();
    });

    ipcMain.handle('index:loadconfig', async () => {

        const config = await loadConfig();
        if(JSON.parse(config).auth === true) {
            await tracker.Initialize(uid, token, appdir, true);
            winMain.webContents.send('push-User', await userJson);
        }
        return config;
    });

    ipcMain.handle('index:updateConfig', (event, configArr) => {
        const config = configArr.config;
        const value = configArr.value;
        console.log(configArr);

        if(config === 'rememberLogin') {

            const config = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'), 'utf-8'));
            config.settings.rememberLogin = value;
            
            fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify(config));
            return value;
        }

        if(config === 'minimizeToTray') {

            const config = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'), 'utf-8'));
            config.settings.minimizeToTray = value;
            
            fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify(config));
            return value;
        }

        if(config === 'systemStartup') {

            const config = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'), 'utf-8'));
            config.settings.systemStartup = value;

            value === true ? app.setLoginItemSettings({ openAtLogin: true }) : app.setLoginItemSettings({ openAtLogin: false });
            fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify(config));
            return value;
        }

        return;
    })

    ipcMain.handle('index:authenticate', async (event, authArgs) => {

        const rememberLogin = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'))).settings.rememberLogin;
        const auth = await authenticate(authArgs, rememberLogin);

        if(auth === true) {
            await tracker.Initialize(uid, token, appdir, true);
            winMain.webContents.send('push-User', await userJson);
            return true;
        }

        return false;
    });

    ipcMain.handle('tracker:toggle', async () => {
        if(starting) return;

        if(tracking) {
            await tracker.Stop();
            tracking = false;
            return;
        }

        starting = true;
        await tracker.Start();
        tracking = true;
        starting = false;
    });

    ipcMain.handle('tracker:getPlaytime', async (event, id) => {

        const res = await tracker.PlaytimeFromId(id);
        console.log(res);
        return res;
    });

    ipcMain.on('logout', async () => {

        try {
            await tracker.Stop();
            tracking = false;
        } catch (err) {

        }

        const config = JSON.parse(fs.readFileSync(path.join(appdir, '/config.json'), 'utf-8'));
        if(config.token) {

            const data = {
                id: false,
                token: false,
                settings: config.settings
            };
            fs.writeFileSync(path.join(appdir, '/config.json'), JSON.stringify(data));
        }
    });

    winMain.removeMenu();
    winMain.loadFile('./pages/ui.html');

    winMain.once('ready-to-show', async () => {
        winMain.show();
        winMain.maximize();

        winMain.webContents.on('did-finish-load', async () => {
            winMain.webContents.send('push-User', await userJson);
        });
    });
};

app.on('window-all-closed', () => {
    app.quit();
});

app.whenReady().then(async () => {
    await appWindow();
  
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await appWindow();
      }
    });
  });