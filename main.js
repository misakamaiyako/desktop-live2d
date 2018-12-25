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
        x:width-300,
        y:height-430,
        // frame:false,
        alwaysOnTop:true,
        // transparent:true,
        backgroundColor:'#00000000'
    });
    // mainWindow.setIgnoreMouseEvents(true);
    let tray = new Tray('./download.ico');
    let files;
    if(fs.existsSync('./files.json')){
        files = JSON.parse(fs.readFileSync('./files.json'));
    } else {
        files = [];
    }
    let initMenu = function () {
        return Menu.buildFromTemplate([
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
                        type: 'normal',
                        label: '添加新模型',
                        click:()=>{
                            dialog.showOpenDialog({properties:['openDirectory']},(filePaths)=>{
                                fs.readdir(filePaths[0],((err, file) =>{
                                    let flag = true;
                                    file.forEach(t=>{
                                        if(/.model\.json/.test(t)){
                                            flag = false;
                                            let modelJSON = fs.readFileSync(filePaths[0]+'\\'+t);
                                            modelJSON = JSON.parse(modelJSON);
                                            const index = files.findIndex(t=>t.name === modelJSON.name);
                                            if(index>-1){
                                                dialog.showMessageBox({
                                                    type: 'info',
                                                    buttons:[
                                                        '保留新模型',
                                                        '保留老模型',
                                                        '都保存'
                                                    ],
                                                    defaultId:0,
                                                    title: '',
                                                    message: '已存在同名的模型'
                                                },(response => {
                                                    if(response===0){
                                                        files.splice(index,1,{
                                                            "name":modelJSON.name,
                                                            "path": path.relative(__dirname,filePaths[0]+'\\'+t)
                                                        })
                                                    } else if(response===2){
                                                        files.push({
                                                            "name":modelJSON.name,
                                                            "path": path.relative(__dirname,filePaths[0]+'\\'+t)
                                                        })
                                                    }
                                                    fs.writeFile('./files.json',JSON.stringify(files,null,4),()=>{})
                                                }))
                                            } else {
                                                files.push({
                                                    "name":modelJSON.name,
                                                    "path": path.relative(__dirname,filePaths[0]+'\\'+t)
                                                });
                                                fs.writeFile('./files.json',JSON.stringify(files,null,4),()=>{})
                                            }
                                            const contextMenu = initMenu();
                                            tray.setContextMenu(contextMenu);
                                        }
                                    });
                                    if(flag){
                                        dialog.showErrorBox( '错误', '没有找到模型文件，请确认该文件夹下存在.model.json文件');
                                    }
                                } ))
                            })
                        }
                    });
                    return file
                })()
            }
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
