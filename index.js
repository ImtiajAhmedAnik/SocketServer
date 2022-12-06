const express = require('express')
const path = require('path')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log("outside io");
var usersList=[];
io.on('connection', function(socket){
    socket.on('join', function(user){
        for (let i = 0; i < usersList.length; i++) {
            if (usersList[i]['id']==user['id']) {
                io.emit('join',false);
                break;
            }else if(i==usersList.length-1){
                usersList.push(user);
                io.emit('join',true);
                io.emit('AllUsers', usersList);
            }
        }
        if(usersList.length==0){
            usersList.push(user);
            io.emit('join',true);
            io.emit('AllUsers', usersList);
        }
        console.log('new user add=>',user);
    });
    socket.on('updateStatus', function(User){
        console.log("updateStatus"+User)
        for (let i = 0; i < usersList.length; i++) {
            if (usersList[i]['id']==User['id']) {
                usersList[i]['isOnline']=User['isOnline'];
                io.emit('AllUsers', usersList);
                break;
            }
        }
    });
    socket.on('AllUsers', function(user){
        io.emit('AllUsers',usersList);
    });
    socket.on('UpdateProfile', function(User){
        console.log("UpdateProfile"+User)
        for (let i = 0; i < usersList.length; i++) {
            if (usersList[i]['id']==User['id']) {
                usersList[i]['image']=User['image'];
                usersList[i]['username']=User['username'];
                io.emit('AllUsers', usersList);
                break;
            }
        }
    });
    socket.on('on typing', function(typing){
        console.log("Typing.... ");
        io.emit('on typing', typing);
    });
    socket.on('chat message', function(msg){
        console.log("Message " + msg['message']);
        io.emit('chat message', msg);
    });
    socket.on('delete', function(user){
        for (let i = 0; i < usersList.length; i++) {
            if (usersList[i]['id']==user['id']) {
                usersList.slice(i,1);
                io.emit('AllUsers', usersList);
                break
            }
        }
        console.log('user delete=>',user);
    });
});
http.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});