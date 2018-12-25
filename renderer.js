// let L2D = require('hexo-helper-live2d');
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('changeModel', (event, arg) => {
    L2Dwidget.init({
        model:{
            jsonPath:arg
        }
    });
});
const { BrowserWindow } = require('electron')
alert(1);
let win = new BrowserWindow()
win.webContents.openDevTools()
