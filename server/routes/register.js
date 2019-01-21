var express=require ('express');
var router=express.Router();
var registerDB = require('../db/registerDB');

router.get('/selectUser',(req,res)=> {
    //console.log("邮箱"+req.query.email)
    var name = req.query.telphone;
    var email = req.query.email;
    registerDB.select_name(name).then(data=>{
        console.log("测试",data)
        if(data.length) {
            res.send('-1')
        }else{
            registerDB.select_email(email).then(data=>{
                console.log("邮箱",data)
                if(data.length){
                    res.send('0')
                }else{
                    res.send('ok')
                }
            }).catch(e=>{
                console.log(e)
            })      
        }
    }).catch(e=>{
        console.log(e)
    })
})

router.post('/',(req,res)=> {
    var name = req.body.telphone;
    var pass = req.body.password;
    var email = req.body.email;
    registerDB.insert_user(name,pass,email).then(data=>{
        res.send('ok')
        //console.log(data)
    }).catch(e=>{
        console.log(e)
    })
})

module.exports = router;