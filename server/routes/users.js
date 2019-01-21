var express = require('express');
var router = express.Router();
var settingDB = require('../db/settingDB');
/* GET users listing. */
router.get('/', function(req, res, next) {
  var name = req.query.telphone
  settingDB.search(name).then(data=>{
    console.log(data)
    res.send(data[0])
  }).catch(e=>{
    console.log(e)
  })
  
});

router.post('/update', function(req, res, next) {
  var name = req.body.telphone
  var pass = req.body.password
  settingDB.update_password(name,pass).then(data=>{
    res.send('ok')
  }).catch(e=>{
    console.log(e)
  })
  
});

module.exports = router;
