var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

app.get('/', function (req, res) {
    res.send('This is RemindMe Server');
});

//Facebook webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'remindme_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler for reveiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
        //if there's a message respond to the message
            sendMessage(event.sender.id, {text: "Do it, you won't"});
        }
    }
    res.sendStatus(200);
});   

//general function for sending messages
function sendMessage(recipientId, message) {
    request({
        //only messages back to me in testing
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
