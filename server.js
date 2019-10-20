var http = require('http')
var fs = require('fs')
var typingUsers = []

var roomList = getRoomList()

function getRoomList(){
    let path = "./roomList.json"
    fs.exists(path, function(exists){
        if(exists){
            fs.readFileSync(path, 'utf-8', function(err, data){
                if(err)
                {
                    throw err
                }
                else {
                var roomList = JSON.parse(data)
                    return (roomList)
                }
            })
        }
        else {
            return (roomList = [
                {id:1,
                name:"test1"},
                {id:2,
                name:"test2"},
                {id:3,
                name:"test3"}
            ])
        }
    })
}

function setDate(){
    var date = ""
    const time = new Date()
    date+= time.getDate().toString()
    date+= time.getMonth().toString()
    date+= time.getFullYear().toString()
    return date
}

function writeToJson(object, room){
    let date = setDate()
    let fullPath = "./log/"+room+"/"+date+".json"
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

function readFromJson(socket, room){
    let date = setDate()
    let fullPath = "./log/"+room+"/"+date+".json"
    console.log("fullPath; "+ fullPath)
    fs.exists(fullPath, function(exists){
        if(exists)
        {
            console.log("file exists")
            fs.readFile(fullPath, 'utf-8', function(err, data){
                if(err)
                {throw err}
                else {
                    socket.emit('history', JSON.parse(data), function(){
                        console.log("history send")
                    })
                    socket.to(room).emit('connected',{
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
            socket.to(room).emit('connected',{
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
                socket.emit('roomList', roomList)
    })


    socket.on('roomSelected', function(room){
        socket.join(room)
        socket.room = room
        readFromJson(socket, room)
        let object = {
            text: socket.username +" has entered the chat",
            sender: "server",
            timestamp: Date.now()}
        socket.broadcast.to(room).emit('broadcast', object)
    })
    socket.on('message', function(object){
        socket.broadcast.to(socket.room).emit('broadcast', object)
        writeToJson(object, socket.room)

    })
    socket.on('disconnect', function(reason){
        console.log(socket.username +" left")
        let object = {
            text: socket.username + " has left the chat. Reason: " + reason,
            sender: "server",
            timestamp: Date.now()
        }
        socket.broadcast.emit('broadcast', object)
        writeToJson(object, socket.room)
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
            socket.broadcast.to(socket.room).emit('isTyping', typingUsers)
    })
})

server.listen(3001, "192.168.1.16")
