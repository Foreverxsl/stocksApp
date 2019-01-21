var express = require('express');
var router = express.Router();
var loginDB = require('../db/loginDB');

// 查找用户名和密码
router.get('/',(req,res)=> {
    var name = req.query.telphone
    var pass = req.query.password
    console.log(name,pass)
    loginDB.select_name(name).then(data=> {
        console.log(data[0])
        if(data[0] == undefined) {
            res.send('-1')
        }else if(data[0]){
            loginDB.select_password(name).then(data=>{
                console.log(data[0].password)
                if(data[0].password !==pass){
                    res.send('0')
                }else{
                    res.send('ok')
                    console.log('登录成功')
                }
                
            }).catch(e=>{
                console.log(e)
            })
        }
    }).catch(e=>{
        console.log(e)
    })
})
module.exports = router;