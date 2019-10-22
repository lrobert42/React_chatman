import React from 'react'

export default class Title extends React.Component{
    render(){
        return(
            <div className="title">
            <h1 className="room_name">{this.props.selectedRoom}</h1>
            </div>
        )
    }
}
