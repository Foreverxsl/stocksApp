var mysql = require('mysql');
//建立连接池
var pool = mysql.createPool({
        host: 'localhost',   
        user:'root',
        password:'root', 
        database:'stocksapp',
    }); 
//执行sql
function execute(sql){
    return new Promise((resolve,reject)=> {
        pool.getConnection(function(err,conn) { 
            if(err){
                reject(err); 
            }else{
                conn.query(sql,function(err,result){
                    if(!err){
                        resolve(result);
                    }else{
                        reject(err);
                    }
                    conn.release(); 
                    console.log("释放完成");
                });
           }
      });
  });
}
module.exports={
    execute
}