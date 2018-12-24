const electron = require('electron');
const {app, BrowserWindow,Tray,Menu} = electron;
const fs = require('fs');
let mainWindow;
function createWindow () {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: 300,
        height: 430,
        x:width-300,
        y:height-430,
        frame:false,
        alwaysOnTop:true,
        transparent:true,
        backgroundColor:'#00000000'
    });
    mainWindow.setIgnoreMouseEvents(true);
    let tray = new Tray('./download.ico');
    let files = fs.readFileSync('./files.json');
    files = JSON.parse(files);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出',
            type: 'normal',
            click:()=>{
                app.quit()
            }
        },
        {
            label: '更换模型',
            type: 'submenu',
            submenu:(()=>{
                let file = [];
                files.forEach(t=>{
                    file.push({
                        label: t.name,
                        type: 'radio'
                    })
                });
                return file
            })()
        }
    ]);
    tray.setToolTip('右键退出');
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
