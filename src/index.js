import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import  cookie  from 'react-cookies'
import Chatroom from './chatComponents/Chatroom.js'
import LoginScreen from './MainScreenComponents/LoginScreen.js'
import MainScreen from './MainScreenComponents/MainScreen'
import Popup from './MainScreenComponents/Popup.js'

const io = require('socket.io-client')
const socket = io.connect('http://192.168.1.14:3001')

class App extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            username:null,
            subscription:[],
            rank:null,
            selectedRoom: null,
            roomList:[],
            isConnected: false,
            userList:[],
            showPopup:null
        }
        this.onBackButtonClicked = this.onBackButtonClicked.bind(this)
        this.onDisconnectClicked = this.onDisconnectClicked.bind(this)
        this.onUserlistClicked = this.onUserlistClicked.bind(this)
    }

    componentDidMount(){
        var connectedCookie = cookie.load('connected')
        if (connectedCookie){
            this.setState({
                isConnected:true,
            }, function(){
                socket.emit('connect_from_cookie', connectedCookie)
            })
        }

        socket.on('connected_from_cookie', data =>{
            console.log(data)
            this.setState({
                username : data.username,
                rank : data.rank,
                subscription : data.subscription
             })
        })

        socket.on('roomList', data =>{
            this.getRoomList(data)
        })

        socket.on('user_list', data =>{
            this.setState({
                userList:data
            })
        })

        socket.io.on('connect_error', () =>{
            this.disconnect()
        })
    }

    disconnect(){
        this.setState({isConnected:false})
        if (cookie.load('connected')){
            cookie.remove('connected')
        }
        alert("You've been disconnected from the server")
    }
    getRoomList(data){
        const array = this.state.roomList
        let newList = array.concat(data)
        this.setState({
            roomList: newList
            })
    }

    roomSelect(room){
        this.setState({selectedRoom:room}, function(){
            socket.emit('roomSelected', this.state.selectedRoom)
        })
    }

    userConnected(data){
        this.setState({
            username : data.username,
            rank : data.rank,
            subscription : data.subscription,
            isConnected:true
        }, function(){
            cookie.save('connected', this.state.username, {maxAge:15*60})
            console.log("User connected. cookie set")
        })
    }

    popupButtonHandler(){
        this.setState({
            showPopup: null
        })
    }

    onBackButtonClicked()
    {
        this.setState({
            selectedRoom:null
        })
    }

    onDisconnectClicked(){
        socket.disconnect()
        this.disconnect()
    }

    onUserlistClicked(){
        console.log("user cliecked")
        this.setState({showPopup: "userList"})
    }

    renderHeader(){
        if (!this.state.isConnected){
            return(
                <div className="mdl-layout mdl-js-layout
                    mdl-layout--fixed-header">
                    <header className="mdl-layout__header">
                        <div className="mdl-layout__header-row">
                            <span className="mdl-layout-title">Chatman</span>

                        </div>
                    </header>
                    <main className="mdl-layout__content">
                        <div className="page-content">
                            <LoginScreen
                                userConnected = {i => this.userConnected(i)}
                                socket={socket}/>
                        </div>
                    </main>
                </div>
            )
        }
        else{
            return(
                <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer
                mdl-layout--fixed-header">
                <header className="mdl-layout__header">
                    <div className="mdl-layout__header-row">
                        {this.state.selectedRoom ?
                            <button className="back_button mdl-button mdl-js-button mdl-button--icon"
                                onClick={this.onBackButtonClicked}>
                          <i className= " material-icons md-18">arrow_back</i>
                        </button> : null}
                        <span className="chatroom_title mdl-layout-title">{this.state.selectedRoom? this.state.selectedRoom : "Chatman"}</span>
                        <div className="mdl-layout-spacer"></div>
                    </div>
                </header>
                <div className="mdl-layout__drawer">
                    <span className="mdl-layout-title">Navigation</span>
                    <nav className="mdl-navigation">
                        <div className="mdl-navigation__link">Browse our channels</div>
                        <div className="mdl-navigation__link"
                            onClick={this.onUserlistClicked}>Connected users</div>
                        <div className="mdl-navigation__link"
                            onClick= {this.onDisconnectClicked}>Disconnect</div>
                    </nav>
                </div>
                <main className="mdl-layout__content">
                    {this.state.showPopup ? <Popup
                        onCloseButtonClicked={() =>this.popupButtonHandler()}
                        userList={this.state.userList}
                        roomList={this.state.roomList}
                        popupType={this.state.showPopup}/> : null
                        }
                    <div className="page-content">{this.renderChat()}</div>
                </main>
            </div>)
        }
    }

    renderChat(){

        if(this.state.selectedRoom){
            return(
                <div className="chatroom">
                <Chatroom
                    selectedRoom = {this.state.selectedRoom}
                    username ={this.state.username}
                    socket={socket}
                    disconnect={() => this.disconnect()}
                 />
            </div>)
        }
        else {
            return(
                <div className = "room_selection">
                <MainScreen
                roomList={this.state.subscription}
                roomSelect={i => this.roomSelect(i)}
                selectedRoom={this.state.selectedRoom}
                userList = {this.state.userList}/>
        </div>)
        }
    }

    render(){
        return(
            <div className="root">
                {this.renderHeader()}
            </div>
        )
    }
}



ReactDOM.render(

    <App />,
    document.getElementById("root"));
