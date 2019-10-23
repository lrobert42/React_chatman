import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import  cookie  from 'react-cookies'
import Chatroom from './chatComponents/Chatroom.js'
import LoginScreen from './MainScreenComponents/LoginScreen.js'

const io = require('socket.io-client')
const socket = io.connect('http://192.168.1.16:3001')


class App extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            username:null,
            subscription:[],
            rank:null,
            selectedRoom: null,
            roomList:[],
            isConnected: false,
            userList:[]
        }
    }

    componentDidMount(){
        var connectedCookie = cookie.load('connected')
        if (connectedCookie){
            this.setState({
                isConnected:true,
            }, function(){
                socket.emit('connect_from_cookie', connectedCookie)
            })
        }

        socket.on('connected_from_cookie', data =>{
            console.log(data)
            this.setState({
                username : data.username,
                rank : data.rank,
                subscription : data.subscription
             })
        })

        socket.on('roomList', data =>{
            this.getRoomList(data)
        })

        socket.on('user_list', data =>{
            this.setState({
                userList:data
            })
        })

        socket.io.on('connect_error', () =>{
            this.setState({isConnected:false})
            if (cookie.load('connected')){
                cookie.remove('connected')
            }
            alert("There's an issue on the server. Please try again later")
        })
    }

    getRoomList(data){
        const array = this.state.roomList
        let newList = array.concat(data)
        this.setState({
            roomList: newList
            })
    }

    roomSelect(room){
        this.setState({selectedRoom:room}, function(){
            socket.emit('roomSelected', this.state.selectedRoom)
        })
    }

    userConnected(data){
        this.setState({
            username : data.username,
            rank : data.rank,
            subscription : data.subscription,
            isConnected:true
        }, function(){
            cookie.save('connected', this.state.username, {maxAge:15*60})
            console.log("User connected. cookie set")
        })
    }

    renderChat(){
    if (!this.state.isConnected){
        return(
        <LoginScreen
        userConnected = {i => this.userConnected(i)}
        socket={socket}/>
        )
    }
    else{
        if(this.state.selectedRoom){
            return(
                <div>
                <MainScreen
                    roomList={this.state.subscription}
                    roomSelect={i => this.roomSelect(i)}
                    selectedRoom={this.state.selectedRoom}
                    userList = {this.state.userList}/>
                <Chatroom
                selectedRoom = {this.state.selectedRoom}
                username ={this.state.username}
                socket={socket}
                 />
            </div>)
        }
        else {
            return(<MainScreen
                roomList={this.state.subscription}
                roomSelect={i => this.roomSelect(i)}
                selectedRoom={this.state.selectedRoom}
                userList = {this.state.userList}/>)
        }
    }
}

    render(){
        return(
            <div className="app">{this.renderChat()} </div>
        )
    }
}

class MainScreen extends React.Component{

constructor(props){
    super(props)
    this.state ={
        drawer: this.props.selectedRoom ? "roomlist_closed_drawer" :"roomlist_open_drawer"
        //drawer: "roomlist_open_drawer"
    }
    this.handleClick = this.handleClick.bind(this)
}
    componentDidMount(){
        if(this.props.roomSelected){
            console.log("updtaing")
            // const wrapper = document.getElementById("wrapper")
            // wrapper.classList.add('closed')
        }
    }
    handleClick(e){
        if (this.props.selectedRoom !== e)
        {
            this.props.roomSelect(e)
        }
    }

    renderRoomList(room){
        return(
        <div className="room" key={room.id} onClick={() => this.handleClick(room.name)}>{room.name}</div>)
    }

    renderUserList(user){

        return(
            <li key={user.socket}>{user.username}</li>
    )}

    render(){
        return(
        <div className={this.state.drawer} id="wrapper">
            {this.props.selectedRoom ? <h3> Your channels </h3> : null}
            {!this.props.roomList ? <h1>You subscription list seems empty... Browse TODO: POPUP</h1> :
                this.props.roomList.map((room) =>(
                this.renderRoomList(room)
            ))}
            <h4>Connected  users</h4>
            <ul>{this.props.userList.map((user) =>(this.renderUserList(user)))}
            </ul>
        </div>
        )}
}
ReactDOM.render(

    <App />,
    document.getElementById("root"));
