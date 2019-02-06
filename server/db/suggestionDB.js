var pool = require('./pool')

module.exports = {
    insert_suggestion(title,desc,telphone) {
        var sql = 'insert into suggestion values(null,"'+title+'","'+desc+'","'+telphone+'")';
        return pool.execute(sql)
    }
}