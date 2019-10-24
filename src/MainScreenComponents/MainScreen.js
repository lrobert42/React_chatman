import React from 'react'

export default class MainScreen extends React.Component{

constructor(props){
    super(props)
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
        <div className="main_screen_wrapper">
            {this.props.selectedRoom ? <h3> Your channels </h3> : null}
            {!this.props.roomList ? <h1>You subscription list seems empty... Browse TODO: POPUP</h1> :
                this.props.roomList.map((room) =>(
                this.renderRoomList(room)
            ))}
            <h4>Connected users</h4>
            <ul>{this.props.userList.map((user) =>(this.renderUserList(user)))}
            </ul>
        </div>
        )}
    }
