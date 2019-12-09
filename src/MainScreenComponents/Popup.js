import React from 'react'

export default class Popup extends React.Component{

constructor(props){
    super(props)
    this.onCloseButtonClicked = this.onCloseButtonClicked.bind(this)
}



renderUserList(user){

    return(
        <li className="mdl-list__item-primary-content" key={user.socket}>{user.username}</li>
)}

onCloseButtonClicked(){
    this.props.onCloseButtonClicked()
}

renderPopup(){
    console.log(this.props.popupType)
    if (this.props.popupType === "userList"){
        return (
            <div className="popup_content">
            <h1> User connected:</h1>
            <ul className="mdl-list">{this.props.userList.map((user) =>(this.renderUserList(user)))}</ul>

            <button className="popup_close_button"
            onClick={this.onCloseButtonClicked}>
            Close popup</button>
            </div>
        )
    }
}


render(){
    return(
        <div className= "popup">
            {this.renderPopup()}
        </div>
    )}
}
