const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'memis123',
    database: 'employees'
})

connection.connect(function(error){
    if (error) throw error
})
module.exports = connection