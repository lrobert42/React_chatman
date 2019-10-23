var http = require('http')
var fs = require('fs')
var typingUsers = []
var connectedUsers = []



function isInArray(array, object){

    if (array.length == 0)
    {
        return null
    }
    else if (typeof object.password === 'undefined' || object.password === null)
    {
        for (i = 0; i < array.length; i++){
            if (array[i].username === object.username)
            {
                let removedPassword = array[i]
                removedPassword.password = null
                return removedPassword
            }
        }
        return null
    }
     else {
        for (i = 0; i < array.length; i++){
            if (array[i].username === object.username && array[i].password == object.password)
            {
                let removedPassword = array[i]
                removedPassword.password = null
                return removedPassword
            }
        }
        return null
    }
}

function checkUserList(socket, credentials){
    let path = "./users/userList.json"
    fs.exists(path, function(exists){
        if (exists){
            fs.readFile(path, 'utf-8', function(err, data){
                if (err){
                    throw err
                }else {
                    var userList = JSON.parse(data)
                    let userInArray = isInArray(userList, credentials)
                    if (userInArray !== null)
                    {
                        console.log(credentials.username +" is connecting")
                        if (typeof credentials.password === 'undefined'){
                            socket.emit('connected_from_cookie', userInArray)
                        }
                        else {
                            socket.emit('connection_approved', userInArray)
                        }
                        socket.user = userInArray
                        userInArray.socket = socket.id
                        connectedUsers.push(userInArray)
                        console.log(connectedUsers)
                        socket.broadcast.emit('user_list', connectedUsers)
                        socket.emit('user_list', connectedUsers)
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
            fs.readFile(path, 'utf-8', function(err, data){
                if (err){
                    throw err
                } else {
                    var userList = JSON.parse(data)
                    let removedPassword = credentials
                    removedPassword.password = null
                    if (isInArray(userList, removedPassword))
                    {
                        console.log(credentials.username +" is already registered")
                        socket.emit('already_registered', credentials.username)
                    }
                    else {
                        credentials.rank="user"
                        credentials.subscription=[]
                        userList.push(credentials)
                        json = JSON.stringify(userList)
                        fs.writeFile(path, json, function(err){
                            if (err)
                            {   throw err}
                            else {
                                console.log("Connection approved. New user: " + credentials.username)
                                socket.emit('connection_approved', credentials)
                                socket.user = credentials
                                credentials.socket = socket.id
                                connectedUsers.push(credentials)
                                console.log(connectedUsers)
                                socket.broadcast.emit('user_list', connectedUsers)
                                socket.emit('user_list', connectedUsers)
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
                        text: socket.user.username +" has entered the room",
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
                text: socket.user.username +" has entered the room",
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

    socket.on('connect_from_cookie', function(received_username){
        let obj={username:received_username}
        checkUserList(socket, obj)
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
                text:socket.user.username+" has exited the room"
            }
            socket.to(oldRoom).emit('broadcast', object)
            writeHistory(object, oldRoom)
        }
        socket.join(room)
        socket.room = room
        readHistory(socket, room)
        let object = {
            text: socket.user.username +" has entered the room",
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
        console.log(socket.user.username +" left")
        if (socket.room){
            let object = {
                text: socket.user.username + " has left the chat. Reason: " + reason,
                sender: "server",
                timestamp: Date.now()
            }
            //socket.emit('disconnect', reason)
            socket.to(socket.room).emit('broadcast', object)
            writeHistory(object, socket.room)
        }
            let newArray = connectedUsers.filter(user => user.username !== socket.user.username)
            console.log("New array: " +newArray)
            connectedUsers = newArray
            socket.broadcast.emit('user_list', connectedUsers)
            socket.emit('user_list', connectedUsers)


        if (typingUsers.includes(socket.user.username)){
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
