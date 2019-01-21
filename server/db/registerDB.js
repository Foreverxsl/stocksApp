var pool = require('./pool')

module.exports = {
    select_name(name) {
        var sql = 'select * from user where telphone ="'+name+'" ';
        return pool.execute(sql)
    },
    select_email(email) {
        var sql = 'select * from user where email ="'+email+'" ';
        return pool.execute(sql)
    },
    insert_user(name,pass,email) {
        var sql = 'insert into user values(null,"'+name+'","'+pass+'","'+email+'")';
        return pool.execute(sql)
    }
}