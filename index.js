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
            
            //TODO add async worker process (Heroku can't deal with timeouts)
            //side-effect remove later
            
            /*
            if (!delayedMessage(event.sender.id, event.message.text)) {
                //works for reminders < 30 sec (heroku timeout)
                console.log("no cmd");
                var msg = "Hi " + event.sender.id + "," + '\n' + "Commands:\n" + "[WIP]remind\n" + "kitten [width] [height]";
                sendMessage(event.sender.id, {text: String(msg)});
            }
            */
            
            
             
            if (!kittenMessage(event.sender.id, event.message.text)) {
                var msg = "Hi " + event.sender.id + "," + '\n' + "Commands:\n" + "[WIP]remind\n" + "kitten [width] [height]";
                sendMessage(event.sender.id, {text: String(msg)});
            }
            
            
            

        //server should handle event when user clicks button
        } else if (event.postback) {

            //output to console just to show postback call
            console.log("Postback received: " + JSON.stringify(event.postback));
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
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function delayedMessage(recipientId, text) {
    text = text || "";
    var values = text.split(' ');
    
    console.log("values: " + values.length);
    console.log("value[0]: " + values[0]);
    //Check for remind command format
    if ((values.length > 2) && (values[0] === 'remind')) {
        if (Number(values[1]) > 0) {
            //busy waiting for now
            var waitUntil = Number(Date.now() + values[1]*60000);
            while (waitUntil > Date.now()) {
                //busy wait TODO fork child/use threads
            }
            var toRemind = "";
            for (i = 2; i < values.length; i++) {
                toRemind += values[i] + ' ';
            }
            
            sendMessage(recipientId, {text: String(toRemind)});

            return true;
        } 
    }

    console.log("reached false");

    return false;
}

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

                                //on button click, returned payload to server
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
