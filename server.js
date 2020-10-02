const express = require('express');
const app = express();
const fs = require('fs');

const  mysql = require('mysql');

var connection = mysql.createConnection({
    host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    port: "3306",
});



app.get('/', (req, res) => {

    if (req.url == '/styles/customStyles.css' ) {
        res.setHeader('Content-Type', 'text/css');
        fs.createReadStream('/styles/customStyles.css').pipe(res);
    } else {
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream('./index.html').pipe(res);
    }

    connection.connect (function(err) {
        if (err){
            res.send('Cant connect to database');
            return;
        }
        res.send('Connected to database!!');
    });
    connection.end();
});

const {PORT = 3000} = process.env;
app.listen(PORT, () => {
    console.log('HELO');
});

