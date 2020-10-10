const { time } = require('console');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const  mysql = require('mysql');

var connection = mysql.createConnection({
    host:"testdatabase-1.c7rplytalvfe.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    database: "userdatabase",
});


app.use('*/assets', express.static(__dirname + "/assets"));

app.get('/', (req, res) => {
    res.send("HELLO WORLD");
});
 
// app.get('*', (req, res) => {
//     res.setHeader('Content-Type', 'text/html');
//     // EXTRACT STORE URL
//     var str = req.url.split("/"); 

//     let rawdata = fs.readFileSync('./assets/stores.json');
//     let stores = JSON.parse(rawdata);

//     // CHECK IF STORE IS VALID
//     let valid = false;
//     for (i = 0; i < stores.length; i++) {
//         if (str[1] === stores[i]) {
//             valid = true;
//         }
//     }

//     // REDIRECT
//     if (valid) {
//         res.sendFile(path.join(__dirname+'/index.html'));
//     } else {
//         res.sendFile(path.join(__dirname+'/invalid.html'));
//         // res.send('Invalid URL');
//     }
// });


app.post('/insert', (req, res) => {
    // GET DATE
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    let formattedDate = year + "-" + month + "-" + date;
    let formattedTime = hours + ":" + minutes + ":" + seconds;
    // prints time in HH:MM format
    console.log(hours + ":" + minutes);


    var content = '';
    req.on('data', function(data){
        content += data;

        var obj = JSON.parse(content);

        console.log("The name is: "+ obj.fullname);
        console.log("The address is: "+ obj.address);
        console.log("The city is: "+ obj.city);
        console.log("The email is: "+ obj.email);
        console.log("The number is: "+ obj.number);
        console.log("The store is: "+ obj.store);

        connection.query('INSERT INTO customer (fullname, address, city, email, number, store, date, time ) VALUES (?,?,?,?,?,?,?,?)',[obj.fullname, obj.address, obj.city, obj.email ,obj.number, obj.store, formattedDate, formattedTime], function(error, results, fields){
        if(error) throw error;
        console.log("Success!");
    });

    res.json({ 
        date: formattedDate, 
        time: formattedTime, 
    })
    });
});

const {PORT = 3000} = process.env;
app.listen(PORT, () => {
    console.log('Server is live...');
});

