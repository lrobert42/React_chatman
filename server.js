var http = require('http')
var fs = require('fs')
var typingUsers = []


var server = http.createServer(function(req, res){
        res.writeHead(200, {"Content-type":"text/html"})
        res.end()
    })
var io = require('socket.io')(server, {
    pingInterval: 100000000,
    pingTimeout: 10000
})

io.sockets.on('connection', function(socket, username){
    socket.on('new_client', function(username){
                socket.username = username
                console.log("new client", username)
                socket.broadcast.emit('broadcast', {
                    text: socket.username +" has entered the chat",
                    sender: "server",
                    timestamp: Date.now()}
                )
    })

    socket.on('message', function(object){
        socket.broadcast.emit('broadcast', object)

    })
    socket.on('disconnect', function(reason){
        console.log(socket.username +" left")
        socket.broadcast.emit('broadcast', {
            text: socket.username + " has left the chat. Reason: " + reason,
            sender: "server",
            timestamp: Date.now()
        })
        if (typingUsers.includes(socket.username)){
            let newList = [...typingUsers]
            let index = newList.indexOf(object.username)
            newList.splice(index, 1)
            typingUsers = newList
        }
    })
    socket.on('isTyping', function(object){
        if (object.bool){
            if(!typingUsers.includes(object.username)){
                let newList = typingUsers.concat(object.username)
                typingUsers = newList
            }
        }
        else {
            if(typingUsers.includes(object.username)){
                let newList = [...typingUsers]
                let index = newList.indexOf(object.username)
                newList.splice(index, 1)
                typingUsers = newList
            }
        }
            socket.broadcast.emit('isTyping', typingUsers)
    })
})

server.listen(4242)
