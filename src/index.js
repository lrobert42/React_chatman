import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const io = require('socket.io-client')
const socket = io.connect('192.168.1.16:3001')

class Chat extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            messageList: [],
            username:null,
            isTyping:false,
            typingUsers:[]
        }
    }

    scrollToBottom () {
    document.getElementById("container").scrollBy(0, 100)
    }

    componentDidMount(){
        if (this.state.username == null){
            var user = prompt("Enter username:")
            while(user === null || user === "")
            {
                alert("You must input a correct user name!")
                user = prompt("Enter username:")
            }
            this.setState(
                {username: user}, function(){
                    socket.emit('new_client', this.state.username)
                    })
        }
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

    componentDidUpdate(){
        this.scrollToBottom()
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
            sender: this.state.username,
            text: messageString,
            timestamp: Date.now()}
        socket.emit('message', message)
        this.addMessage(message)
    }

    isTyping(bool){
        if (this.state.isTyping !== bool){
            this.setState(
                {isTyping:bool}, function(){
                    socket.emit('isTyping', {
                    username:this.state.username,
                    bool: bool
                })
            })
        }
    }

        render(){
            return(
                <div className="app">

                <MessageList
                    typingUsers = {this.state.typingUsers}
                    messageList={this.state.messageList}
                    username={this.state.username}
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
function Title(){
        return(
            <div className="title">
            <h1 className="room_name">Chatman</h1>
            </div>
        )
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

    <Chat />,
    document.getElementById("root"));
