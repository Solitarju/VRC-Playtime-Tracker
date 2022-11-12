const { Sequelize, DataTypes } = require('sequelize');
const { WebSocket } = require('ws');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const events = require('events');

const eventEmitter = new events.EventEmitter();

module.exports.events = eventEmitter;

const Initialize = async (uid, token, dataPath, trackFriends) => {
    var intervalLoop;
    var wss;

    var friendsDb = [];

    const wssurl = `wss://vrchat.com/?authToken=${token.slice(token.indexOf('=')+1)}`;
    const dbPath = path.join(dataPath, `/db/${uid}.sqlite`);

    eventEmitter.emit('Initialized');

    const connectDb = async (path) => {
        const sequelizeInstance = new Sequelize({
            dialect: 'sqlite',
            storage: path
        });
        
        const trackerModel = sequelizeInstance.define('trackerModel', {
            state: {
                type: DataTypes.STRING,
                allowNull: false
            },
            initialDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedDate: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            timestamps: false
        });
        
        await sequelizeInstance.sync();
        return { sequelizeInstance, trackerModel };
    }

    const { sequelizeInstance, trackerModel } = await connectDb(dbPath);

    const isOnline = async () => {
        const controller = new AbortController();
        setTimeout(() => { controller.abort }, 5000);
        const User = await fetch(`https://vrchat.com/api/1/users/${uid}`, { signal: controller.signal, method: 'get', headers: { "cookie": `apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26; ${token};`, "referer": `https://vrchat.com/home`, "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' } })
        .then((res) => { return res; });
        console.log(User.status);
    
        const json = await User.json();
        const onlinestate = await json.state;
        
        const result = await onlinestate === 'online' ? true : false;
        console.log(`isOnline? ${result}`);
        return result;
    }

    const onlineFriends = async () => {
        const controller = new AbortController();
        setTimeout(() => { controller.abort }, 5000);
        const Friends = await fetch(`https://vrchat.com/api/1/auth/user/friends?offline=false&n=50&offset=0`, {
            signal: controller.signal,
            method: 'get',
            headers: {
                "cookie" : `apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26; ${token};`,
                "referer": `https://vrchat.com/home`,
                "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
            }
        })
        .then((res) => { return res; });

        return await Friends.json();
    }

    const updateOnline = async (_state) => {
        console.log(`Update ${_state}`);

        const count = await trackerModel.count();
        const lastTag = await trackerModel.findOne({ 
            where: {
                id: count
            }
        });

        if(count < 1) {

            if(_state === 'online') {
                console.log('created online tag');
                eventEmitter.emit('user-online');
                await trackerModel.create({
                    state: _state,
                    initialDate: Date.now()
                });
                return;
            }
        } else {

            if(_state === 'online' && await lastTag.getDataValue('state') === 'offline') {
                console.log('created online tag');
                eventEmitter.emit('user-online');

                await trackerModel.create({
                    state: _state,
                    initialDate: Date.now()
                });
                return;
            };
    
            if(_state === 'online' && _state === await lastTag.getDataValue('state')) {
                console.log('updated online tag');
                await trackerModel.update({ updatedDate: Date.now() }, {
                    where: {
                        id: await lastTag.getDataValue('id')
                    }
                })
                return;
            };
    
            if(_state === 'offline' && _state !== await lastTag.getDataValue('state')) {
                console.log('created offline tag');
                eventEmitter.emit('user-offline');
    
                await trackerModel.create({
                    state: _state,
                    initialDate: Date.now()
                });
                return;
            };
        };

        return;
    }

    const Update = async () => {

        if(await isOnline()) {

            await updateOnline('online');
        } else {

            await updateOnline('offline');
            startInterval(600000);
        }
    }

    const startInterval = (arg_interval) => {

        if(intervalLoop) {

            clearInterval(intervalLoop);
            intervalLoop = setInterval(Update, arg_interval ? arg_interval : 150000);
            return;
        }

        intervalLoop = setInterval(Update, arg_interval ? arg_interval : 150000);
    }

    const currentUsrPlaytime = async() => {

        var totaldifference = 0;
        var totaldifference14d = 0;
        var totaldifference28d = 0;
        var largestdifference = 0;

        var arr_past14d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if(!fs.existsSync(path.join(dataPath, `/db/${uid}.sqlite`))) {
            return false;
        }

        const count = await trackerModel.count();

        const onlineTags = await trackerModel.findAll({
            where: {
                state: 'online'
            }
        });

        for (let i in onlineTags) {

            const onlineDate = await onlineTags[i].getDataValue('initialDate');

            if (onlineTags[i].id === count) {

                totaldifference += Date.now() - onlineDate;
                totaldifference14d += Date.now() - onlineDate;
                totaldifference28d += Date.now() - onlineDate;
                arr_past14d[13] += Date.now() - onlineDate;

                largestdifference < Date.now() - onlineDate ? largestdifference = Date.now() - onlineDate : false;
                return { "total": totaldifference, "past14d": totaldifference14d, "past28d": totaldifference28d, "longest": largestdifference, "arrpast14d": arr_past14d };
            }

            const offlineTag = await trackerModel.findOne({
                where: {
                    id: (await onlineTags[i].getDataValue('id') + 1)
                }
            });

            const offlineDate = await offlineTag.getDataValue('initialDate');
            largestdifference < offlineDate - onlineDate ? largestdifference = offlineDate - onlineDate : false;
            totaldifference += offlineDate - onlineDate;

            if(Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7) < 14) {

                const index = Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7);
                arr_past14d[13-index] += offlineDate - onlineDate;
            }

            if (Date.now() - onlineDate < 2419200000) {
                if (Date.now() - onlineDate < 1210000000) {
                    totaldifference14d += offlineDate - onlineDate;
                }
                
                totaldifference28d += offlineDate - onlineDate;
            }
        }

        return { "total": totaldifference, "past14d": totaldifference14d, "past28d": totaldifference28d, "longest": largestdifference, "arrpast14d": arr_past14d };
    }
    
    const PlaytimeFromId = async(_uid) => {

        var totaldifference = 0;
        var totaldifference14d = 0;
        var totaldifference28d = 0;
        var largestdifference = 0;

        var arr_past14d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if(_uid === uid) {

            const res = await currentUsrPlaytime();
            return res;
        }

        if (!fs.existsSync(path.join(dataPath, `/db/f_${uid}/${_uid}.sqlite`))) {

            return false;
        }

        if (friendsDb[_uid]) {
            const _trackerModel = friendsDb[_uid].trackerModel;
            const count = await _trackerModel.count();

            const onlineTags = await _trackerModel.findAll({
                where: {
                    state: 'online'
                }
            });

            for (let i in await onlineTags) {

                const onlineDate = await onlineTags[i].getDataValue('initialDate');

                if (onlineTags[i].id === await count) {

                    totaldifference += Date.now() - onlineDate;
                    totaldifference14d += Date.now() - onlineDate;
                    totaldifference28d += Date.now() - onlineDate;
                    arr_past14d[13] += Date.now() - onlineDate;

                    largestdifference < Date.now() - onlineDate ? largestdifference = Date.now() - onlineDate : false;
                    return { "total": totaldifference, "past14d": totaldifference14d, "past28d": totaldifference28d, "longest": largestdifference, "arrpast14d": arr_past14d };
                }

                const offlineTag = await _trackerModel.findOne({
                    where: {
                        id: (await onlineTags[i].getDataValue('id') + 1)
                    }
                });

                const offlineDate = await offlineTag.getDataValue('initialDate');
                largestdifference < offlineDate - onlineDate ? largestdifference = offlineDate - onlineDate : false;
                totaldifference += offlineDate - onlineDate;

                if(Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7) < 14) {

                    const index = Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7);
                    arr_past14d[13-index] += offlineDate - onlineDate;
                }

                if (Date.now() - onlineDate < 2419200000) {
                    if (Date.now() - onlineDate < 1210000000) {
                        totaldifference14d += offlineDate - onlineDate;
                    }

                    totaldifference28d += offlineDate - onlineDate;
                }
            }

            return { "total": totaldifference, "past14d": totaldifference14d, "past28d": totaldifference28d, "longest": largestdifference, "arrpast14d": arr_past14d };
        }

        const { sequelizeInstance, trackerModel } = await connectDb(path.join(dataPath, `/db/f_${uid}/${_uid}.sqlite`));

        const count = await trackerModel.count();
        const lastTag = await trackerModel.findOne({
            where: {
                id: count
            }
        });

        if (await lastTag.getDataValue('state') === 'online') {

            const lastDate = await lastTag.getDataValue('updatedDate') ? await lastTag.getDataValue('updatedDate') : await lastTag.getDataValue('initialDate');
            await trackerModel.create({
                state: 'offline',
                initialDate: lastDate
            });
        }

        const onlineTags = await trackerModel.findAll({
            where: {
                state: 'online'
            }
        });

        for (let i in onlineTags) {

            const onlineTag = onlineTags[i];
            const offlineTag = await trackerModel.findOne({
                where: {
                    id: (await onlineTag.getDataValue('id') + 1)
                }
            });

            const onlineDate = await onlineTag.getDataValue('initialDate');
            const offlineDate = await offlineTag.getDataValue('initialDate');

            totaldifference += await offlineDate - await onlineDate;
            largestdifference < await offlineDate - await onlineDate ? largestdifference = await offlineDate - await onlineDate : false;

            if(Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7) < 14) {

                const index = Math.floor((new Date().getTime() - new Date(onlineDate).getTime())/8.64e+7);
                arr_past14d[13-index] += offlineDate - onlineDate;
            }

            if (Date.now() - onlineDate < 2419200000) {
                if (Date.now() - onlineDate < 1210000000) {
                    totaldifference14d += offlineDate - onlineDate;
                }
                    
                totaldifference28d += offlineDate - onlineDate;
            }
        }

        await sequelizeInstance.close();
        return { "total": totaldifference, "past14d": totaldifference14d, "past28d": totaldifference28d, "longest": largestdifference, "arrpast14d": arr_past14d };
    }

    module.exports.PlaytimeFromId = PlaytimeFromId;
    
    const Start = async () => {
        console.log('start');
        eventEmitter.emit('tracker-start');

        var stopping = false;

        if(await isOnline() === true) {

            await updateOnline('online');
            startInterval();
        } else {

            startInterval(600000);
        }

        if(trackFriends === true) {

            const friendsJson = await onlineFriends();

            for (const friend in friendsJson) {
    
                const f_uid = friendsJson[friend].id;
                console.log(f_uid);
                
                
                const { sequelizeInstance, trackerModel } = await connectDb(path.join(dataPath, `/db/f_${uid}/${f_uid}.sqlite`));
                const count = await trackerModel.count();
                if(count > 0) {
                    const lastTag = await trackerModel.findOne({
                        where: {
                            id: count
                        }
                    });
    
                    if(await lastTag.getDataValue('state') === 'online') {
                        console.log(`fixing tag: ${friendsJson[friend].displayName} (${f_uid})`);
    
                        const lastDate = await lastTag.getDataValue('updatedDate') ? await lastTag.getDataValue('updatedDate') : await lastTag.getDataValue('initialDate');
                        await trackerModel.create({
                            state: 'offline',
                            initialDate: lastDate
                        });
                    }
                }
                
                console.log(`creating online tag: ${friendsJson[friend].displayName} (${f_uid})`);
                await trackerModel.create({
                    state: 'online',
                    initialDate: Date.now()
                });
    
                friendsDb[f_uid] = { sequelizeInstance, trackerModel };
            }
        }

        const StartWebsocket = async () => {

            wss = new WebSocket(wssurl, 'websocket', {
                headers: {
                    'Cookie': `apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26; ${token};`,
                    'Upgrade': 'websocket',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                },
                host: 'vrchat.com',
                origin: 'https://vrchat.com',
            });

            var aliveInterval;
            wss.on('open', () => {
                eventEmitter.emit('ws-connected');

                aliveInterval = setInterval(async() => {
                    if(stopping) {

                        return;
                    }

                    try {
    
                        wss.ping();
                    } catch {

                        clearInterval(aliveInterval);
                    }
                }, 5000)
            });
    
            wss.on('close' , async () => {
                clearInterval(aliveInterval);
                if(stopping === true) {

                    return;
                }

                eventEmitter.emit('ws-disconnected');
                await StartWebsocket();
            });
            

            var eventTimeout;
            wss.on('error', () => {
                stopping = true;
                clearTimeout(eventTimeout);
                eventTimeout = setTimeout(async () => {
                    console.log('ws error');
                    await StartWebsocket();
                    eventEmitter.emit('ws-disconnected');
                }, 5000);
            });
    
            wss.on('message', async (data) => {
                eventEmitter.emit('ws-update');
                    const jsondata = JSON.parse(data.toString());
    
                    if (jsondata.type === 'user-location') {
                        console.log('user-location');
    
                        await updateOnline('online');
                        startInterval();
                        return;
                    }
    
                    if(trackFriends === true) {
    
                        
                        if (jsondata.type === 'friend-online') {
                            const contentJson = JSON.parse(jsondata.content);
    
                            if(!friendsDb[contentJson.userId]) {

                                const db = await connectDb(path.join(dataPath, `/db/f_${uid}/${contentJson.userId}.sqlite`))

                                const count = await db.trackerModel.count();
                                const lastTag = await db.trackerModel.findOne({
                                    where: {
                                        id: count
                                    }
                                });

                                if(count > 0) {
                                    if(await lastTag.getDataValue('state') === 'online') {

                                        const lastDate = await lastTag.getDataValue('updatedDate') ? await lastTag.getDataValue('updatedDate') : await lastTag.getDataValue('initialDate');
                                        await db.trackerModel.create({
                                            state: 'offline',
                                            initialDate: await lastDate
                                        });
    
                                        await db.trackerModel.create({
                                            state: 'online',
                                            initialDate: Date.now()
                                        });
                                        friendsDb[contentJson.userId] = db;
                                        console.log(`created online tag: (${contentJson.userId})`);
                                        return;
                                    }

                                    await db.trackerModel.create({
                                        state: 'online',
                                        initialDate: Date.now()
                                    });
                                    friendsDb[contentJson.userId] = db;
                                    console.log(`created online tag: (${contentJson.userId})`);
                                    return;
                                }
                                
                                await db.trackerModel.create({
                                    state: 'online',
                                    initialDate: Date.now()
                                });
                                friendsDb[contentJson.userId] = db;
                                console.log(`created online tag: (${contentJson.userId})`);
                                return;
                            }
                            return;
                        }
    
                        if(jsondata.type === 'friend-location') {
                            const contentJson = JSON.parse(jsondata.content);
    
                            if(!friendsDb[contentJson.userId]) { 
                                return;
                            }

                            const db = friendsDb[contentJson.userId];
                            const count = await db.trackerModel.count();
                            const lastTag = await db.trackerModel.findOne({
                                where: {
                                    id: await count
                                }
                            });

                            if(await count > 0) {
                                if(await lastTag.getDataValue('state') === 'online') {

                                    await db.trackerModel.update({ updatedDate: Date.now() }, {
                                        where: {
                                            id: await count
                                        }
                                    });
                                    console.log(`updated ${await lastTag.getDataValue('state')} tag: (${contentJson.userId})`);
                                    return;
                                }
                                return;
                            }
                            return;
                        }
    
                        if(jsondata.type === 'friend-offline') {
                            const contentJson = JSON.parse(jsondata.content);

                            if(!friendsDb[contentJson.userId]) {
                                return;
                            }

                            const db = friendsDb[contentJson.userId];
                            const count = await db.trackerModel.count();
                            const lastTag = await db.trackerModel.findOne({
                                where: {
                                    id: await count
                                }
                            });

                            if(await count > 0) {
                                if(await lastTag.getDataValue('state') === 'online') {
                                    await db.trackerModel.create({
                                        state: 'offline',
                                        initialDate: Date.now()
                                    });
                                    friendsDb.splice(friendsDb.indexOf(contentJson.userId), 1);
                                    console.log(`created offline tag: (${contentJson.userId})`);
                                    return;
                                }
                                return;
                            }
                            return;
                        }
                    }
                })

        }

        await StartWebsocket();

        const Stop = async () => {
            console.log('stop');

            stopping = true;

            wss.terminate();
            wss = undefined;

            eventEmitter.emit('tracker-stop');

            clearInterval(intervalLoop);
            intervalLoop = undefined;

            if(await trackerModel.count() > 0) {

                const lastTag = await trackerModel.findOne({
                    where: {
                        id: await trackerModel.count()
                    }
                });

                if(await lastTag.getDataValue('state') === 'online') {

                    await updateOnline('offline');
                }
            }

            for (const id in friendsDb) {
                const count = await friendsDb[id].trackerModel.count();
                const _lastTag = await friendsDb[id].trackerModel.findOne({
                    where: {
                        id: await count
                    }
                });

                if(await _lastTag.getDataValue('state') === 'online') {

                    friendsDb[id].trackerModel.create({
                        state: 'offline',
                        initialDate: Date.now()
                    });
                }
            }

            friendsDb = [];
            stopping = false;
        }

        module.exports.Stop = Stop;
    }
    module.exports.Start = Start;
};

module.exports.Initialize = Initialize;