import React from 'react'


export default class MessageInput extends React.Component{
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
