const loader = document.getElementById('loader');
const wfitag = document.getElementById('wfi-tag');

const loginDiv = document.getElementById('login-container');
const authUsername = document.getElementById('usernameInput');
const authPassword = document.getElementById('passwordInput');
const loginSubmit = document.getElementById('submitAuth');
const logoutSubmit = document.getElementById('logoutBtn');

const settingsBtn = document.getElementById('settings-btn');
const settingsImg = document.getElementById('settings-img');

const rememberLogin = document.getElementById('remember-login');
const systemTrayToggle = document.getElementById('settings-tray');
const systemStartupToggle = document.getElementById('settings-sysstart');

const sidebar = document.getElementById('sidebar');
const sidebarMain = document.getElementById('sidebar-main');
const tracker = document.getElementById('tracker');
const settingsDiv = document.getElementById('settings');
const stats = document.getElementById('stats');

const btnsq = document.getElementsByClassName("btns-quad");
const trackerBtn = document.getElementById("tracker-btn");
const statsBtn = document.getElementById("stats-btn");

const statsInput = document.getElementById('stats-input');
const statsDisplayName = document.getElementById('stats-userid');
const statsTotal = document.getElementById('stats-total');
const stats14d = document.getElementById('stats-14d');
const stats28d = document.getElementById('stats-28d');
const statsLongest = document.getElementById('stats-longest')

const statsChart = document.getElementById('chart');

const userTag = document.getElementById("usertag");
const timer = document.getElementById("timer");

const wsUpdateTag = document.getElementById("ws-update");
const wsConnectionTag = document.getElementById("ws-connection");
const sessionTag = document.getElementById("user-session")

const controlClose = document.getElementById("close");
const controlMaximize = document.getElementById("maximize");
const controlMinimize = document.getElementById("minimize");

const controlMain = document.getElementById("controlMain");

var localUserDataCache;

var chartRender;

var startDate;
var sessionStart;

var timerInterval;
var sessionInterval;
var wsUpdateInterval;

var lastWsUpdate;

for (var i = 0 ; i < btnsq.length; i++) {
    const btn = btnsq[i];
    btnsq[i].addEventListener('click', () => {

        if(!btn.classList.contains('btnsq-active')){
            for(let i = 0; i < btnsq.length; i++) {

                btnsq[i].classList.remove('btnsq-active');
            }
            btn.classList.add('btnsq-active');
        }
    }); 
}

const RenderChart = (res) => {

    try {
        chartRender.destroy();
    } catch {

    }

    const currentDate = new Date();
    const days = [
        `${currentDate.getDate()-13 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-13)).toString().padStart(2, "0") : (currentDate.getDate() - 13).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-13)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-12 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-12)).toString().padStart(2, "0") : (currentDate.getDate() - 12).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-12)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-11 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-11)).toString().padStart(2, "0") : (currentDate.getDate() - 11).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-11)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-10 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-10)).toString().padStart(2, "0") : (currentDate.getDate() - 10).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-10)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-9 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-9)).toString().padStart(2, "0") : (currentDate.getDate() - 9).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-9)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-8 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-8)).toString().padStart(2, "0") : (currentDate.getDate() - 8).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-8)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-7 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-7)).toString().padStart(2, "0") : (currentDate.getDate() - 7).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-7)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-6 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-6)).toString().padStart(2, "0") : (currentDate.getDate() - 6).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-6)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-5 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-5)).toString().padStart(2, "0") : (currentDate.getDate() - 5).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-5)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-4 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-4)).toString().padStart(2, "0") : (currentDate.getDate() - 4).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-4)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-3 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-3)).toString().padStart(2, "0") : (currentDate.getDate() - 3).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-3)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-2 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-2)).toString().padStart(2, "0") : (currentDate.getDate() - 2).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-2)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate()-1 < 1 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() + (currentDate.getDate()-1)).toString().padStart(2, "0") : (currentDate.getDate() - 1).toString().padStart(2, "0")}/${(new Date(new Date(currentDate).setDate(currentDate.getDate()-1)).getMonth() + 1).toString().padStart(2, "0")}`,
        `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`
    ];
    const data = {
        labels:  days,
        datasets: [{
            label: 'Playtime (0 - 24hr)',
            backgroundColor: '#5db48d',
            fill: {
                target: 'origin',
                above: '#1c1c1e'
            },
            borderColor: '#1c1c1e',
            data: res.arrpast14d.map(x => x/3.6e+6),
        }]
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 24,
                    grid: {
                        color: '#000000',
                    }
                }, 
                x: {
                    grid: {
                        color: '#000000',
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                legend: {
                    display: false,
                }
            }
        }
    };
    chartRender = new Chart(
        statsChart,
        config
    );
}

function msToHMS (ms) {

    var seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)));

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " year(s)";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " month(s)";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " day(s)";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hour(s)";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minute(s)";
    }
    return Math.floor(seconds) + " second(s)";
  }

function iterate() {

    const dateNow = new Date();
    const offset = dateNow - startDate;
    timer.innerText = `${msToHMS(offset)}`;
}

function iterateWsUpdate() {

    wsUpdateTag.innerText = `${timeSince(lastWsUpdate)} ago`;
    const timeNow = Date.now();

    if(timeNow - lastWsUpdate < 900000) { 
        wsUpdateTag.classList.replace("idle", "stable");
        wsUpdateTag.classList.replace("error", "stable");
    };
    if(timeNow - lastWsUpdate > 900000 && timeNow - lastWsUpdate < 1800000) {
        wsUpdateTag.classList.replace("error", "idle");
        wsUpdateTag.classList.replace("stable", "idle");
    };
    if(timeNow - lastWsUpdate > 1800000) {
        wsUpdateTag.classList.replace("idle", "error");
        wsUpdateTag.classList.replace("stable", error);
    };
}

const loadConfig = async() => {

    const config = JSON.parse(await BackendContext.loadConfig());
    
    if(config.auth === true) {

        loader.classList.add('nodisplay');
        sidebar.classList.remove('nodisplay');
        tracker.classList.remove('nodisplay');
    } else {

        loader.classList.add('nodisplay');
        loginDiv.classList.remove('nodisplay');
    }

    rememberLogin.checked = config.settings.rememberLogin ? config.settings.rememberLogin : false;
    systemTrayToggle.checked = config.settings.minimizeToTray ? config.settings.minimizeToTray : true;
    systemStartupToggle.checked = config.settings.systemStartup ? config.settings.systemStartup : false;
}

rememberLogin.onclick = () => {

    functions.updateConfig({ config: 'rememberLogin', value: rememberLogin.checked });
};

systemTrayToggle.onclick = () => {

    functions.updateConfig({ config: 'minimizeToTray', value: systemTrayToggle.checked });
};

systemStartupToggle.onclick = () => {

    functions.updateConfig({ config: 'systemStartup', value: systemStartupToggle.checked });
};

trackerBtn.onclick = () => {

    tracker.classList.remove('nodisplay');
    stats.classList.add('nodisplay');
};

settingsBtn.onclick = () => {

    if(settingsDiv.classList.contains('nodisplay')) {

        settingsDiv.classList.remove('nodisplay');
        sidebarMain.classList.add('nodisplay');
        settingsImg.src = './arrow_back_FILL0_wght400_GRAD0_opsz48.png';
    } else {

        settingsDiv.classList.add('nodisplay');
        sidebarMain.classList.remove('nodisplay');
        settingsImg.src = './settings_FILL0_wght400_GRAD0_opsz48.png';
    }
}

statsBtn.onclick = async() => {

    stats.classList.remove('nodisplay');
    tracker.classList.add('nodisplay');

    const res = await functions.getPlaytime(localUserDataCache.id);

    if(res === false) {
        statsDisplayName.innerText = localUserDataCache.id;
        statsTotal.innerText = `Total Tracked Playtime: No data`;
        stats14d.innerText = `Tracked Playtime (Past 14d): No data`;
        stats28d.innerText = `Tracked Playtime (Past 28d): No data`;
        statsLongest.innerText = `Longest Tracked Session: No data`;
        return;
    }

    RenderChart(res);

    statsDisplayName.innerText = localUserDataCache.id;
    statsTotal.innerText = `Total Tracked Playtime: ${msToHMS(res.total)}`;
    stats14d.innerText = `Tracked Playtime (Past 14d): ${msToHMS(res.past14d)}`;
    stats28d.innerText = `Tracked Playtime (Past 28d): ${msToHMS(res.past28d)}`;
    statsLongest.innerText = `Longest Tracked Session: ${msToHMS(res.longest)}`;
};

statsInput.addEventListener('keypress', async(event) => {
    if(event.key === "Enter") {

        const res = await functions.getPlaytime(statsInput.value);

        if(res === false) {
            statsDisplayName.innerText = statsInput.value;
            statsTotal.innerText = `Total Tracked Playtime: No data`;
            stats14d.innerText = `Tracked Playtime (Past 14d): No data`;
            stats28d.innerText = `Tracked Playtime (Past 28d): No data`;
            statsLongest.innerText = `Longest Tracked Session: No data`;
            return;
        }

        RenderChart(res);
    
        statsDisplayName.innerText = statsInput.value;
        statsTotal.innerText = `Total Tracked Playtime: ${msToHMS(res.total)}`;
        stats14d.innerText = `Tracked Playtime (Past 14d): ${msToHMS(res.past14d)}`;
        stats28d.innerText = `Tracked Playtime (Past 28d): ${msToHMS(res.past28d)}`;
        statsLongest.innerText = `Longest Tracked Session: ${msToHMS(res.longest)}`;
    }
}); 

loginSubmit.onclick = async() => {

    loginDiv.classList.add('nodisplay');
    loader.classList.remove('nodisplay');

    const res = await functions.authenticate({ username: authUsername.value, password: authPassword.value });

    if(res === true) {
        loader.classList.add('nodisplay');
        sidebar.classList.remove('nodisplay');
        tracker.classList.remove('nodisplay');
        return;
    }

    loader.classList.add('nodisplay');
    loginDiv.classList.remove('nodisplay');
};

logoutSubmit.onclick = () => {

    clearInterval(wsUpdateInterval);
    clearInterval(timerInterval);
    clearInterval(sessionInterval);
    
    localUserDataCache = undefined;
    startDate = undefined;
    sessionStart = undefined;
    lastWsUpdate = undefined;

    userTag.innerText = `Logged in as, User`;

    sidebar.classList.add('nodisplay');
    tracker.classList.add('nodisplay');
    loginDiv.classList.remove('nodisplay');

    functions.logout();
};

window.BackendContext.loadUser((event, userdata) => {

    console.log(userdata);

    localUserDataCache = userdata;
    userTag.innerText = `Logged in as, ${userdata.displayName}`;
});

window.events.on((event, evType) => {
    index.log(evType)
    if(!evType) return;

    if(evType === 'tracker-start') {

        !controlMain.classList.contains('mainBtn-active') ? controlMain.classList.add('mainBtn-active') : controlMain.classList.replace('mainBtn-active', 'mainBtn-active');
        controlMain.getElementsByClassName("mainBtnImg")[0].src = './Pause.png';
        startDate = Date.now();
        timerInterval = setInterval(iterate, 1000);
        return;
    };

    if(evType === 'tracker-stop') {

        controlMain.classList.contains('mainBtn-active') ? controlMain.classList.remove('mainBtn-active') : controlMain.classList.remove('mainBtn-active');
        controlMain.getElementsByClassName("mainBtnImg")[0].src = './arrow.png';

        clearInterval(timerInterval);
        clearInterval(wsUpdateInterval);

        wsConnectionTag.classList.replace("stable", "idle");
        wsConnectionTag.classList.replace("error", "idle");
        wsUpdateTag.classList.replace("stable", "idle");
        wsUpdateTag.classList.replace("error", "idle");

        wsUpdateTag.innerText = 'None';
        wsConnectionTag.innerText = 'Waiting...';
        timer.innerText = '00:00:00';
        return;
    };

    if(evType === 'user-online') {

        sessionStart = Date.now();
        sessionInterval = setInterval(() => {
            sessionTag.innerText = msToHMS(Date.now() - sessionStart);
        }, 1000);
        sessionTag.classList.replace("idle", "stable");
        sessionTag.classList.replace("error", "stable");
        return;
    };

    if(evType === 'user-offline') {

        clearInterval(sessionInterval);
        sessionTag.innerText = `00:00:00`;
        sessionTag.classList.replace("stable", "idle");
        sessionTag.classList.replace("error", "idle");
        return;
    }

    if(evType === 'ws-connected') {

        wsConnectionTag.innerText = "Connected";

        wsConnectionTag.classList.replace("idle", "stable");
        wsConnectionTag.classList.replace("error", "stable");

        lastWsUpdate = Date.now();
        if(wsUpdateInterval) clearInterval(wsUpdateInterval);
        wsUpdateInterval = setInterval(iterateWsUpdate, 1000);
        return;
    };

    if(evType === 'ws-disconnected') {

        wsConnectionTag.innerText = "Disconnected";
        wsConnectionTag.classList.replace("idle", "error");
        wsConnectionTag.classList.replace("stable", "error");
        return;
    };

    if(evType === 'ws-update') {

        lastWsUpdate = Date.now();
        if(wsUpdateInterval) clearInterval(wsUpdateInterval);
        wsUpdateInterval = setInterval(iterateWsUpdate, 1000);
        return;
    };
});

controlClose.onclick = () => {

    index.close();
}

controlMaximize.onclick = () => {

    index.maximize();
}

controlMinimize.onclick = () => {

    index.minimize();
}

controlMain.onclick = async () => {

    await functions.trackerToggle();
};

if(navigator.onLine) {

    loadConfig();
} else {
    
    wfitag.classList.remove('nodisplay');
    const listener = addEventListener('online', () => {

        loadConfig();
        wfitag.classList.add('nodisplay');
        removeEventListener(listener);
    })
}