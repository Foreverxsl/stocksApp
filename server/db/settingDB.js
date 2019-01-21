var pool = require('./pool')

module.exports = {
    search(name) {
        var sql = 'select * from user where telphone ="'+name+'" ';
        return pool.execute(sql)
    },
    update_password(name,pass) {
        var sql="update user set password = '"+pass+"' where telphone ='"+name+"' ";
        return pool.execute(sql)
    }
}