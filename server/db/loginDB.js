var pool = require('./pool')

module.exports = {
    // 查找用户名
    select_name(tel) {
        var sql = 'select * from user where telphone ="'+tel+'" ';
        console.log(sql)
        return pool.execute(sql);       
    },
    // 查找用户名对应的密码
    select_password(tel) {
        var sql= 'select password from user where telphone ="'+tel+'" ';
        return pool.execute(sql);
    },
    // 修改用户密码
    update_password(tel,password) {
        var sql="update user set password = '"+tel+"' where username ='"+name+"' ";
        return pool.execute(sql);
    } 

}