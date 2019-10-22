import React from 'react'

export default class MessageList extends React.Component{
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
