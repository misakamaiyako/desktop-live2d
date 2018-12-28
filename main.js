const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, dialog, ipcMain} = electron;
const fs = require('fs');
const path = require('path');
let mainWindow;
function createWindow () {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: 300,
        height: 430,
        x:width-300+1,
        y:height-430,
        frame:false,
        alwaysOnTop:true,
        transparent:true,
        backgroundColor:'#00000000'
    });

    let tray = new Tray('./download.ico');
    let files;
    if(fs.existsSync('./files.json')){
        files = JSON.parse(fs.readFileSync('./files.json'));
    } else {
        files = [];
    }
    mainWindow.setIgnoreMouseEvents(true);
    let initMenu = function () {
        return Menu.buildFromTemplate([
            {
                label: '更换模型',
                type: 'submenu',
                submenu:(()=>{
                    let file = [];
                    files.forEach(t=>{
                        file.push({
                            label: t.name,
                            type: 'normal',
                            click:()=>{
                                mainWindow.webContents.send('changeModel', t.path);
                            }
                        })
                    });
                    file.push({
                        type: 'separator'
                    });
                    file.push({
                        label: '更新模型',
                        type: 'normal',
                        click:()=>{
                            let newModel = [];
                            fs.readdir('./models',(err,data)=>{
                                for(let a in data){
                                    fs.readdir('./models/'+data[a],(errA,dataA)=>{
                                        for( let b in dataA){
                                            if(/assets/.test(dataA[b])){
                                                fs.readdir(`./models/${data[a]}/${dataA[b]}`,(errB,dataB)=>{
                                                    for(let c in dataB){
                                                        if(/.+model\.json/.test(dataB[c])){
                                                            let modelJSON = fs.readFileSync(`./models/${data[a]}/${dataA[b]}/${dataB[c]}`);
                                                            modelJSON = JSON.parse(modelJSON);
                                                            newModel.push({
                                                                name: modelJSON.name,
                                                                path: `./models/${data[a]}/${dataA[b]}/${dataB[c]}`
                                                            });
                                                            fs.writeFile('./files.json',(JSON.stringify(newModel,null,4)),()=>{});
                                                            files = newModel;
                                                            initMenu();
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    });
                    return file
                })()
            },
            {
                label: '锁定',
                type: 'checkbox',
                checked:true,
                click:(menuItem)=>{
                    mainWindow.setIgnoreMouseEvents(menuItem.checked);
                }
            },
            {
                label: '退出',
                type: 'normal',
                click:()=>{
                    app.quit()
                }
            },
        ]);
    };
    // tray.setToolTip('右键退出');
    const contextMenu = initMenu();
    tray.setContextMenu(contextMenu);
    mainWindow.setSkipTaskbar(true);
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null
    });
    setInterval(()=>{
        console.log(tray.isDestroyed())
    },1000)
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});
