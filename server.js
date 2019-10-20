var http = require('http')
var fs = require('fs')
var typingUsers = []


function setDate(){
    var date = ""
    const time = new Date()
    date+= time.getDate().toString()
    date+= time.getMonth().toString()
    date+= time.getFullYear().toString()

    return date
}

function writeToJson(string, object){
    let fullPath = "./log/"+string+".json"
    fs.exists(fullPath, function(exists){
        if(exists)
        {
            fs.readFile(fullPath, 'utf-8', function(err, data){
                if (err)
                    {throw err}
                else {
                    var read = JSON.parse(data)
                    read.push(object)

                    json = JSON.stringify(read)
                    fs.writeFile(fullPath, json, function(err){
                        if (err)
                        {throw err}
                    })
                }
            })
        }
        else {
            console.log(object)
            let table = [object]
            json = JSON.stringify(table)
            fs.writeFile(fullPath, json, function(err){
                if(err){
                    throw(err)
                }
            })
        }
    })
}

function readFromJson(socket){
    let date = setDate()
    let fullPath = "./log/"+date+".json"
    fs.exists(fullPath, function(exists){
        if(exists)
        {
            fs.readFile(fullPath, 'utf-8', function(err, data){
                if(err)
                {throw err}
                else {
                    socket.emit('history', JSON.parse(data))
                    socket.emit('connected',{
                        text: socket.username +" has entered the chat",
                        sender: "server",
                        timestamp: Date.now()
                    })
                }
            })
        }
        else{
            socket.emit('history',
            {sender: "server",
            timestamp: Date.now(),
            text:"No history today"})
            socket.emit('connected',{
                text: socket.username +" has entered the chat",
                sender: "server",
                timestamp: Date.now()
            })
        }
    })
}

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
                readFromJson(socket)
                let object = {
                    text: socket.username +" has entered the chat",
                    sender: "server",
                    timestamp: Date.now()}
                socket.broadcast.emit('broadcast', object)

    })

    socket.on('message', function(object){
        socket.broadcast.emit('broadcast', object)
        writeToJson(setDate(), object)

    })
    socket.on('disconnect', function(reason){
        console.log(socket.username +" left")
        let object = {
            text: socket.username + " has left the chat. Reason: " + reason,
            sender: "server",
            timestamp: Date.now()
        }
        socket.broadcast.emit('broadcast', object)
        writeToJson(setDate(), object)
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

server.listen(3001, "192.168.1.16")
