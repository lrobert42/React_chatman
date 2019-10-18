var http = require('http')
var fs = require('fs')

var server = http.createServer(function(req, res){
        res.writeHead(200, {"Content-type":"text/html"})
        res.end()
    })
 console.log("server connected")

var id = 0
var io = require('socket.io').listen(server)

io.sockets.on('connection', function(socket, nickname){
    console.log("Someone there")
    socket.on('new_client', function(username){
            // if (username == null || username == "")
            // {
            //     socket.emit('error_username', "You must input a correct user name!")
            //     console.log("Error username")
            // } else {
                socket.username = username
                console.log("new client", username)
                socket.broadcast.emit('broadcast', {
                    text: socket.username +" has entered the chat",
                    sender: "server",
                    timestamp: Date.now()}
                )
            // }
    })

    socket.on('message', function(object){
        id = id + 1
        console.log("Message from: " + object.sender)
        console.log("message received: " + object.text)
        socket.broadcast.emit('broadcast', object)
    })
})

server.listen(4242)
