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
                                        "path": path.relative(__dirname,filePaths[0]+'\\'+t).replace(/\\/g,'/')
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
