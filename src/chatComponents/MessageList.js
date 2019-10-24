import React from 'react'

export default class MessageList extends React.Component{


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

                </div>

            </div>
        )
    }
}
