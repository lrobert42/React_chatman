import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

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
            roomList: newList}, function(){
                console.log("Roomlist: "+this.state.roomList)
            })
    }

    roomSelect(room){
        this.setState({selectedRoom:room}, function(){
            socket.emit('roomSelected', this.state.selectedRoom)
        })
    }

    renderChat(){
        if(this.state.selectedRoom){
            return(
                <div>
                <MainScreen
                    roomList={this.state.roomList}
                    roomSelect={i => this.roomSelect(i)}
                    selectedRoom={this.state.selectedRoom}/>
                <Chatroom
                selectedRoom = {this.state.selectedRoom}
                username ={this.state.username} />
            </div>)
        }
        else {
            return(<MainScreen
                roomList={this.state.roomList}
                roomSelect={i => this.roomSelect(i)}
                selectedRoom={this.state.selectedRoom}/>)
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
    }
    this.handleClick = this.handleClick.bind(this)
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

class Chatroom extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            messageList: [],
            isTyping:false,
            typingUsers:[]
        }
    }

    scrollToBottom () {
    document.getElementById("container").scrollBy(0, 100)
    }

    componentDidMount(){
        socket.on('connected', data=>{
            this.addMessage(data)
        })

        socket.on('broadcast', data =>{
            this.addMessage(data)
        })

        socket.on('isTyping', data =>{

            data == null ? this.setState({typingUsers: []}) : this.setState({typingUsers: data})
        })

        socket.on('history', array=>{
            console.log("history received")
            let i = 0
            if(array){
                while(i < array.length){
                this.addMessage(array[i])
                i++
                }
            }
        })
        this.scrollToBottom()
    }

    componentDidUpdate(prevProps){
        this.scrollToBottom()
        if (this.props.selectedRoom !== prevProps.selectedRoom)
        {
            this.setState({messageList:[]})
        }
    }
    addMessage(object) {
        const array = this.state.messageList
        let newList = array.concat([object])
        this.setState({
            messageList: newList},function(){

            this.scrollToBottom()})
    }

    sendMessage(messageString){
        const message = {
            sender: this.props.username,
            text: messageString,
            timestamp: Date.now(),
            room: this.props.selectedRoom}
        socket.emit('message', message)
        this.addMessage(message)
    }

    isTyping(bool){
        if (this.state.isTyping !== bool){
            this.setState(
                {isTyping:bool}, function(){
                    socket.emit('isTyping', {
                    username:this.props.username,
                    bool: bool,
                    room:this.props.selectedRoom
                })
            })
        }
    }

        render(){
            return(
                <div className="app">
                    <Title
                    selectedRoom={this.props.selectedRoom}/>
                    <MessageList
                        typingUsers = {this.state.typingUsers}
                        messageList={this.state.messageList}
                        username={this.props.username}
                     />
                    <MessageInput
                        sendMessage={i=> this.sendMessage(i)}
                        isTyping={bool => this.isTyping(bool)}
                    />
                </div>
            )
        }
}
 // eslint-disable-next-line
class Title extends React.Component{
    render(){
        return(
            <div className="title">
            <h1 className="room_name">{this.props.selectedRoom}</h1>
            </div>
        )
    }
}

class MessageList extends React.Component{
    renderIsTyping(array){
        if (array.length)
        {
            if (array.length === 1)
            {   return(
                <div>{array} is typing</div>
            )
            } else {
            return(
                <div>{array.join(', ')} are typing</div>
            )
            }
        }
    }

    renderMessageList(object){
        if (object.sender === "server"){
            return (
                <div className="server_info" key={object.timestamp}><strong>{object.sender} :</strong>  {object.text}</div>
            )
        }
        if(object.sender === this.props.username){
            return(
            <div className="message_out" key={object.timestamp}><strong>{object.sender} :</strong>  {object.text}</div>)
        } else {
            return(
            <div className="message_in" key={object.timestamp}><strong>{object.sender} :</strong>  {object.text}</div>)
        }
    }

    render(){
        return(
            <div className="message_container" id="container">
                <div className="message_list">
                    {this.props.messageList.map((messageList) =>(
                        this.renderMessageList(messageList)
                    ))}
                    <div className="is_typing">
                        {this.renderIsTyping(this.props.typingUsers)}
                    </div>
                </div>

            </div>
        )
    }
}


class MessageInput extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            message:''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event){
        this.setState({
            message: event.target.value
        })
            if(event.target.value !== ''){
                this.props.isTyping(true)
            }
            else {
                this.props.isTyping(false)
            }
        event.preventDefault()
    }

    handleSubmit(event){
        if(this.state.message){
            this.props.sendMessage(this.state.message)
        }
            this.setState({
                message:''
            }, function(){
                this.props.isTyping(false)
            })
         event.preventDefault();
    }

    render(){
        return(
            <form
               onSubmit={this.handleSubmit}
               className="send_message_form">
               <input
                   onChange={this.handleChange}
                   value={this.state.message}
                   placeholder="Type your message and hit ENTER"
                   type="text"/>
           </form>
        )
    }
}

ReactDOM.render(

    <App />,
    document.getElementById("root"));
