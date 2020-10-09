const { time } = require('console');
const express = require('express');
const app = express();
const fs = require('fs');

const  mysql = require('mysql');

var connection = mysql.createConnection({
    host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    database: "userdatabase",
});


app.use('/assets', express.static(__dirname + "/assets"));

app.get('*', (req, res) => {
    // console.log(req.url);
 
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
    console.log('Connect via GET');

});

app.post('/insert', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    var content = '';
    req.on('data', function(data){
        content += data;

        var obj = JSON.parse(content);

        console.log("The name is: "+ obj.fullname);
        console.log("The address is: "+ obj.address);
        console.log("The city is: "+ obj.city);
        console.log("The email is: "+ obj.email);
        console.log("The number is: "+ obj.number);

        // var conn = con.getConnection();

        let date_ob = new Date();

        // current date
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);

        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = date_ob.getHours();

        // current minutes
        let minutes = date_ob.getMinutes();

        // current seconds
        let seconds = date_ob.getSeconds();

        // prints date in YYYY-MM-DD format
        console.log(year + "-" + month + "-" + date);

        // prints date & time in YYYY-MM-DD HH:MM:SS format
        console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

        // prints time in HH:MM format
        console.log(hours + ":" + minutes);

        connection.query('INSERT INTO customer (fullname, address, city, email, number, date, time ) VALUES (?,?,?,?)',[obj.fullname, obj.address, obj.city, obj.email ,obj.number, year + "-" + month + "-" + date, hours + ":" + minutes], function(error, results, fields){
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

