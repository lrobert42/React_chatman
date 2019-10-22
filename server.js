var http = require('http')
var fs = require('fs')
var typingUsers = []


function isInArray(array, object){

    if (array.length == 0)
    {
        return false
    } else {
        for (i = 0; i < array.length; i++){
            if (array[i].username === object.username && array[i].password == object.password)
            {
                return true
            }
        }
        return false
    }
}

function checkUserList(socket, credentials){
    let path = "./users/userList.json"
    fs.exists(path, function(exists){
        if (exists){
            fs.readFile(path, 'utf-8', function(err, data){
                if (err){
                    throw erre
                }else {
                    var userList = JSON.parse(data)
                    if (isInArray(userList, credentials))
                    {
                        console.log(credentials.username +" is connecting")
                        socket.emit('connection_approved', credentials.username)
                        socket.username = credentials.username
                        getRoomList(socket)
                    }
                    else {
                        console.log("Wrong credentials. Connection denied")
                        socket.emit('connection_denied')
                    }
                }
            })
        }
    })
}

function registerUser(socket, credentials){
    let path = "./users/userList.json"
    fs.exists(path, function(exists){
        if (exists){
            console.log("file exists")
            fs.readFile(path, 'utf-8', function(err, data){
                if (err){
                    throw err
                } else {
                    var userList = JSON.parse(data)
                    console.log(userList)
                    if (isInArray(userList, credentials))
                    {
                        console.log(credentials.username +" is already registered")
                        socket.emit('already_registered', credentials.username)
                    }
                    else {
                        userList.push(credentials)
                        console.log(userList)
                        json = JSON.stringify(userList )
                        fs.writeFile(path, json, function(err){
                            if (err)
                            {   throw err}
                            else {
                                console.log("Connection approved. New client: " + credentials.username)
                                socket.emit('connection_approved', credentials.username)
                                socket.username = credentials.username,
                                getRoomList(socket)
                            }
                        })
                    }
                }
            })
        }
    })
}

function getRoomList(socket){
    let path = "./roomList.json"
    fs.exists(path, function(exists){
        if(exists){
            fs.readFile(path, 'utf-8', function(err, data){
                if(err)
                {
                    throw err
                }
                else {
                var roomList = JSON.parse(data)
                socket.emit('roomList', roomList)
                }
            })
        }
        else {
            var roomList = [
                {id:1,
                name:"test1"},
                {id:2,
                name:"test2"},
                {id:3,
                name:"test3"}
            ]
            socket.emit('roomList', roomList)
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

function writeHistory(object, room){
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

function readHistory(socket, room){
    let date = setDate()
    let fullPath = "./log/"+room+"/"+date+".json"
    fs.exists(fullPath, function(exists){
        if(exists)
        {
            fs.readFile(fullPath, 'utf-8', function(err, data){
                if(err)
                {throw err}
                else {
                    socket.emit('history', JSON.parse(data), function(){
                    })
                    socket.emit('connected',{
                        text: socket.username +" has entered the room",
                        sender: "server",
                        timestamp: Date.now()
                    })
                }
            })
        }
        else{
            socket.emit('history',[
            {sender: "server",
            timestamp: Date.now(),
            text:"No history today"}])
            socket.to(room).emit('connected',{
                text: socket.username +" has entered the room",
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

    socket.on('connect_from_cookie', function(username){
    //    socket.emit('connection_approved', username)
        socket.username = username
        getRoomList(socket)
    })
    socket.on('new_client', function(credentials){
                checkUserList(socket, credentials)
            })

    socket.on('registration_asked', credentials =>{
        registerUser(socket, credentials)
    })

    socket.on('roomSelected', function(room){

        if(socket.room)
        {
            const oldRoom = socket.room
            let object = {
                sender:"server",
                timestamp:Date.now(),
                text:socket.username+" has exited the room"
            }
            socket.to(oldRoom).emit('broadcast', object)
            writeHistory(object, oldRoom)
        }
        socket.join(room)
        socket.room = room
        readHistory(socket, room)
        let object = {
            text: socket.username +" has entered the room",
            sender: "server",
            timestamp: Date.now()}
        socket.to(room).emit('broadcast', object)
        writeHistory(object, socket.room)
    })
    socket.on('message', function(object){
        socket.broadcast.to(socket.room).emit('broadcast', object)
        writeHistory(object, socket.room)

    })
    socket.on('disconnect', function(reason){
        console.log(socket.username +" left")
        if (socket.room){
            let object = {
                text: socket.username + " has left the chat. Reason: " + reason,
                sender: "server",
                timestamp: Date.now()
            }
            socket.broadcast.to(socket.room).emit('broadcast', object)
            writeHistory(object, socket.room)
        }

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
