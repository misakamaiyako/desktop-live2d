// let L2D = require('hexo-helper-live2d');
let ipcRenderer = require('electron').ipcRenderer;
let json = require('./files.json');
ipcRenderer.on('changeModel', (event, arg) => {
    L2Dwidget.init({
        model:{
            jsonPath:arg
        }
    });
});
if(json.length>0){
    L2Dwidget.init({
        model:{
            jsonPath:json[0].path
        }
    });
}
