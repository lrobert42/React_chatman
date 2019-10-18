import React from 'react'
import ReactDOM from 'react-dom'

const io = require('socket.io-client')
const socket = io.connect('localhost:4242')

class Chat extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            messageList: [],
            username:null
        }
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
                    this.addMessage({
                        text: this.state.username + " has entered the chat",
                        sender:"server",
                        timestamp: Date.now()})
                    })
        }
        socket.on('broadcast', data =>{
            let newList = this.state.messageList.concat([data])
            this.setState({messageList: newList})
        })

    }
    addMessage(object) {
        const array = this.state.messageList
        let newList = array.concat([object])
        this.setState({
            messageList: newList})
    }

    sendMessage(messageString){
        const message = {sender: this.state.username,
            text: messageString,
            timestamp: Date.now()}
        socket.emit('message', message)
        this.addMessage(message)
    }

        render(){
            return(
                <div className="app">
                <Title />
                <MessageList
                    messageList={this.state.messageList}
                    username={this.state.username}
                 />
                <MessageInput
                    sendMessage={i=> this.sendMessage(i)}
                />
                </div>
            )
        }
}

function Title(){
        return(
            <h1>Chatman</h1>
        )
    }

class MessageList extends React.Component{

renderMessageList(object){
    if(object.sender === this.props.username){
        return(
        <li key={object.timestamp}><strong>{object.sender}:</strong>  {object.text}</li>)
    } else {
        return(
        <li key={object.timestamp}><strong>{object.sender}:</strong>  {object.text}</li>)
    }
}

    render(){
        return(
            <ul>
            {this.props.messageList.map((messageList) =>(
                this.renderMessageList(messageList)
            ))}
            </ul>
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
    }

    handleSubmit(event){
        this.props.sendMessage(this.state.message)
        console.log("message sent")
        this.setState({
            message:''
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
