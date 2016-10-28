# RemindMe
Your personal fb messenger notification slave

## TODO
Buggy implementation of remind command: (busy-wait sucks)
e.g. 'remind [min] [reminder with spacing allowed] --> 'remind .25 eat lunch'
- Would successfully remind the user in 15s to 'eat lunch', however it currently spams the user every 15s
- Possible reason: /webhook is going insane because 15s is too long for a response time and it's adding the command back into the events array
- Fix would be to implement mongoDB and RabbitMQ (allowing async storing of reminders and bacground jobs)
