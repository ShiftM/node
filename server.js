const { time } = require('console');
const express = require('express');
const { google } = require('googleapis');
const app = express();
const fs = require('fs');
const path = require('path');

const  mysql = require('mysql');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const SPREADSHEET_ID = '1VlgJU7RrbmnViENHqDljLNYFSZgBQkJYUyGAvODAFf0';
const RANGE = 'Sheet1';


var connection = mysql.createConnection({
    host:"samsungexperiencestoredb.c7rplytalvfe.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "ax6&+BHu6GbfsAG",
    database: "userdatabase",
});


app.use('*/assets', express.static(__dirname + "/assets"));
 
app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    // EXTRACT STORE URL
    var str = req.url.split("/"); 

    let rawdata = fs.readFileSync('./assets/stores.json');
    let stores = JSON.parse(rawdata);

    // CHECK IF STORE IS VALID
    let valid = false;
    for (i = 0; i < stores.length; i++) {
        if (str[1] === stores[i].toLowerCase()) {
            valid = true;
        }
    }

    // REDIRECT
    if (valid) {
        res.sendFile(path.join(__dirname+'/index.html'));
    } else {
        res.sendFile(path.join(__dirname+'/invalid.html'));
        // res.send('Invalid URL');
    }
});


app.post('/insert', (req, res) => {
    // GET DATE
    let date_ob = GetAbsoluteHKTime();

    let date = ("0" + date_ob.date).slice(-2);
    let month = ("0" + (date_ob.month + 1)).slice(-2);
    let year = date_ob.year;
    let hours = ('0' + date_ob.hour).slice(-2);
    let minutes = ('0' + date_ob.minute).slice(-2);
    let seconds = ('0' + date_ob.second).slice(-2);

    let formattedDate = year + "-" + month + "-" + date;
    let formattedTime = hours + ":" + minutes + ":" + seconds;
    // prints time in HH:MM format
    // console.log(dTime);

    var content = '';
    req.on('data', function(data){
        content += data;

        var obj = JSON.parse(content);

        // Match store to JSON to get proper capitalition
        let rawdata = fs.readFileSync('./assets/stores.json');
        let stores = JSON.parse(rawdata);

        // FOR WEBSITE
        let storeCorrectedCase;

        // FIND THE STORE 
        for (i = 0; i < stores.length; i++) {
            if (obj.store === stores[i].toLowerCase()) {
                storeCorrectedCase = stores[i];
            }
        }

        let samsungOmitted = obj.store;
        // SEE IF THERE IS 'SAMSUNG' IN FRONT OF THE STORE NAME
        if ( obj.store.replace(/-.*/,'') === 'samsung') {
            // REMOVE SAMSUNG PART
            samsungOmitted = obj.store.split('-').slice(1).join('-');
            storeCorrectedCase = storeCorrectedCase.split('-').slice(1).join('-');
        }



        // console.log("The name is: "+ obj.fullname);
        // console.log("The address is: "+ obj.address);
        // console.log("The city is: "+ obj.city);
        // console.log("The email is: "+ obj.email);
        // console.log("The number is: "+ obj.number);
        // console.log("The store is: "+ storeCorrectedCase);
        // console.log("The store is: "+ samsungOmitted);


        // // INSERT TO MYSQL
        // connection.query('INSERT INTO customer (fullname, address, city, email, number, store, date, time ) VALUES (?,?,?,?,?,?,?,?)',[obj.fullname, obj.address, obj.city, obj.email ,obj.number, samsungOmitted, formattedDate, formattedTime], function(error, results, fields){
        //     if(error) throw error;
        //     console.log("Successfully Logged customer: "+ obj.fullname );

                  
        // });
        // INSERT TO SHEETS
        insertToSheets( JSON.stringify({"data": [[ ' ' , obj.fullname, obj.address, obj.city, obj.email ,obj.number, formattedDate, formattedTime, samsungOmitted]]})); 

        res.json({ 
            date: formattedDate, 
            time: formattedTime,
            store: storeCorrectedCase
        })
    });
});

function GetAbsoluteHKTime()
{
    var now = new Date();
    now.setUTCHours(now.getUTCHours() + 8);
    return {
        "year" : now.getUTCFullYear(),
        "month" : now.getUTCMonth(),
        "date" : now.getUTCDate(),
        "hour" : now.getUTCHours(),
        "minute" : now.getUTCMinutes(),
        "second" : now.getUTCSeconds()
    };
}

function insertToSheets (data) {
        var dataContent = '';
        dataContent += data;

        // console.log(data);
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);

            // Authorize a client with credentials, then call the Google Sheets API.
            const { client_secret, client_id, redirect_uris }  = JSON.parse(content).installed;
            let oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) console.log('Token not found. Please generate a new one');
                // Set oAuth Credentials
                oAuth2Client.setCredentials(JSON.parse(token));

                var obj = JSON.parse(dataContent);
                const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
                    
                // Add data to GSheets
                saveDataAndSendResponse(obj.data, sheets);
            });
        });
}


function saveDataAndSendResponse(data, googleSheetsObj) {
    // console.log(data);

    // data is an array of arrays
    // each inner array is a row
    // each array element (of an inner array) is a column
    let resource = {
        values: data,
    };

    googleSheetsObj.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'RAW',
        resource,
    }, (err, result) => {
        if (err) {
            console.log(err);
            // response.end('An error occurd while attempting to save data. See console output.');
        } else {
            const responseText = `${result.data.updates.updatedCells} cells appended.`;
            console.log(responseText);
            // response.end(responseText);
        }
    });

}

const {PORT = 3000} = process.env;
app.listen(PORT, () => {
    console.log('Server is live...');
});

