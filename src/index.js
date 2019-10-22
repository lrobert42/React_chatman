import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Chatroom from './chatComponents/Chatroom.js'

const io = require('socket.io-client')
const socket = io.connect('192.168.1.16:3001')

class App extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            username: null,
            selectedRoom: null,
            roomList:[]
        }
    }

    componentDidMount(){
        if (this.state.username == null){
            // var user= "Bernard"
            var user = prompt("Enter username:")
            while(user === null || user === "")
            {
                alert("You must input a correct user name!")
                user = prompt("Enter username:")
            }
            this.setState({
                username: user}, function(){
                    socket.emit('new_client',
                     this.state.username)
            })
        }
        socket.on('roomList', data =>{
            this.getRoomList(data)
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

    renderChat(){
    // if (!cookie){
    //
    //     <Login />
    // }
    // else{
        if(this.state.selectedRoom){
            return(
                <div>
                <MainScreen
                    roomList={this.state.roomList}
                    roomSelect={i => this.roomSelect(i)}
                    selectedRoom={this.state.selectedRoom}/>
                <Chatroom
                selectedRoom = {this.state.selectedRoom}
                username ={this.state.username}
                socket={socket} />
            </div>)
        }
        else {
            return(<MainScreen
                roomList={this.state.roomList}
                roomSelect={i => this.roomSelect(i)}
                selectedRoom={this.state.selectedRoom}/>)
        }
    }
// }

    render(){
        return(
            <div className="app">{this.renderChat()} </div>
        )
    }
}

class Login extends React.Component{

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

    render(){
        return(
        <div className={this.state.drawer} id="wrapper">
            {this.props.roomList.map((roomList) =>(
                this.renderRoomList(roomList)
            ))}
        </div>
        )}
}
ReactDOM.render(

    <App />,
    document.getElementById("root"));
