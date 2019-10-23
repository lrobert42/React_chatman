import React from 'react'
import MessageInput from './MessageInput.js'
import MessageList from './MessageList.js'
import Title from './Title.js'

export default class Chatroom extends React.Component{
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
        this.props.socket.on('connected', data=>{
            this.addMessage(data)
        })

        this.props.socket.on('broadcast', data =>{
            this.addMessage(data)
        })

        this.props.socket.on('isTyping', data =>{

            data == null ? this.setState({typingUsers: []}) : this.setState({typingUsers: data})
        })

        this.props.socket.on('disconnect', reason =>{
            this.props.disconected()
        })

        this.props.socket.on('history', array=>{
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
        this.props.socket.emit('message', message)
        this.addMessage(message)
    }

    isTyping(bool){
        if (this.state.isTyping !== bool){
            this.setState(
                {isTyping:bool}, function(){
                    this.props.socket.emit('isTyping', {
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
