const express = require('express');
const app = express();
const fs = require('fs');

const  mysql = require('mysql');

var connection = mysql.createConnection({
    host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    database: "userdatabase",

    // port: "3306",
});

// var connection = mysql.createConnection({
//     host:"localhost",
//     user: "root",
//     password: "",
//     database: "userdatabase",
// });

app.get('*', (req, res) => {
    console.log(req.url);
    // if (req.url == '/styles/customStyles.css' ) {
    //     res.setHeader('Content-Type', 'text/css');
    //     fs.createReadStream('/styles/customStyles.css').pipe(res);
    // } else {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream('./index.html').pipe(res);


    var conn = mysql.createConnection({
        host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "12345678",
        database: "userdatabase",
    });

    conn.query('SELECT * FROM stores', function(error, results, fields){
        if(error) throw error;
        // Compare URL with result. Check to see if the url matches the stores available
        var storeName = 'null';
        
        results.forEach((store)=>
        {
            // Do if url from QR Code is valid
            if (req.url === "/" + store.linkid) {
                console.log('VALID');
                storeName = store.linkid
            } 

        });
        console.log(storeName);        
    });

    conn.end(); 


    // }
    // res.send('Hello');
    console.log('Connect via GET')


    // connection.connect (function(err) {
    //     if (err){
    //         res.send('Cant connect to database');
    //         return;
    //     }
    //     res.send('Connected to database!!');
    // });
    // connection.end();
});

// app.get('/styles', (req, res) => {
//     res.setHeader('Content-Type', 'text/css');
//     fs.createReadStream('/styles/customStyles.css').pipe(res);
// });
// app.get('/functions.js', (req, res) => {
//     res.writeHead(200, {"Content-Type":"text/javascript"});
//     fs.createReadStream("./functions.js").pipe(res);
// });

app.post('/insert', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    var content = '';
    req.on('data', function(data){
        content += data;

        var obj = JSON.parse(content);

        console.log("The email is: "+ obj.email);
        console.log("The password is: "+ obj.password);
        // var conn = con.getConnection();

        connection.query('INSERT INTO customer (email, pass) VALUES (?,?)',[obj.email,obj.password], function(error, results, fields){
        if(error) throw error;
        console.log("Success!");
    });

    connection.end();
    res.end("Success!");
    });
});

const {PORT = 3000} = process.env;
app.listen(PORT, () => {
    console.log('Server is live...');
});

