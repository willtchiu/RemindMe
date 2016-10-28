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

            //side-effect remove later
            if (!kittenMessage(event.sender.id, event.message.text)) {

                //if there's a message respond to the message if no kitten cmd
                sendMessage(event.sender.id, {text: "Do it, you won't"});
            }
        } else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});   
app.get('/cmdmanager', function (req, res) {
sendMessage()
}



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
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function kittenMessage(recipientId, text) {
    text = text || "";
    var values = text.split(' ');

    //Checks if the 'kitten' command was called and there are 3 total params
    if (values.length === 3 && values[0] === 'kitten') {
        
        //Checking that width/height are positive
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {
            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/"
                + Number(values[2]);

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitty4u :3",
                            "subtitle": "Kittens for dayz",
                            "image_url": imageUrl,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show source"
                                }, {
                                "type": "postback",
                                "title": "I like this kitty",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;
};
