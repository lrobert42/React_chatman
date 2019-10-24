import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import  cookie  from 'react-cookies'
import Chatroom from './chatComponents/Chatroom.js'
import LoginScreen from './MainScreenComponents/LoginScreen.js'
import MainScreen from './MainScreenComponents/MainScreen'

const io = require('socket.io-client')
const socket = io.connect('http://192.168.1.16:3001')

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
            userList:[]
        }
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
        alert("There's an issue on the server. Please try again later")
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

    renderHeader(){
        if (!this.state.isConnected){
            return(
                <div class="mdl-layout mdl-js-layout
                    mdl-layout--fixed-header">
                    <header class="mdl-layout__header">
                        <div class="mdl-layout__header-row">
                            <span class="mdl-layout-title">Chatman</span>

                        </div>
                    </header>
                    <main class="mdl-layout__content">
                        <div class="page-content">{this.renderChat()}</div>
                    </main>
                </div>
            )
        }
        else{
            // if (!this.state.selectedRoom){
            return(
                <div class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer
                mdl-layout--fixed-header">
                <header class="mdl-layout__header">
                    <div class="mdl-layout__header-row">
                        <span class="mdl-layout-title">Chatman</span>
                        <div class="mdl-layout-spacer"></div>
                    </div>
                </header>
                <div class="mdl-layout__drawer">
                    <span class="mdl-layout-title">Navigation</span>
                    <nav class="mdl-navigation">
                        <div class="mdl-navigation__link" href="">Browse our channels</div>
                        <div class="mdl-navigation__link" href="">Connected users</div>
                        <div class="mdl-navigation__link" href="">Create room</div>
                        <div class="mdl-navigation__link" href="">Disconnect</div>
                    </nav>
                </div>
                <main class="mdl-layout__content">
                    <div class="page-content">{this.renderChat()}</div>
                </main>
            </div>)
        // }
      //   else{
      //       return(
      //           <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header
      //               mdl-layout--fixed-tabs">
      //               <header class="mdl-layout__header">
      //                   <div class="mdl-layout__header-row">
      //                       <span class="mdl-layout-title">Chatman</span>
      //                   </div>
      //                   <div class="mdl-layout__tab-bar mdl-js-ripple-effect">
      //                       <div href="#fixed-tab-1" class="mdl-layout__tab is-active">Room1</div>
      //                       <div href="#fixed-tab-2" class="mdl-layout__tab">Room2</div>
      //                       <div href="#fixed-tab-3" class="mdl-layout__tab">Room3</div>
      //                   </div>
      //               </header>
      //               <div class="mdl-layout__drawer">
      //                   <span class="mdl-layout-title">Title</span>
      //               </div>
      //               <main class="mdl-layout__content">
      //                   <section class="mdl-layout__tab-panel is-active" id="fixed-tab-1">
      //                       <div class="page-content"></div>
      //                   </section>
      //                   <section class="mdl-layout__tab-panel" id="fixed-tab-2">
      //                       <div class="page-content">    caca</div>
      //                   </section>
      //                   <section class="mdl-layout__tab-panel" id="fixed-tab-3">
      //                       <div class="page-content">caac</div>
      //                   </section>
      //               </main>
      //           </div>
      // )
      //   }

        }
    }

    renderChat(){

    if (!this.state.isConnected){
        return(
            <div className="login_screen">
                <LoginScreen
                    userConnected = {i => this.userConnected(i)}
                    socket={socket}/>
        </div>)
    }
    else{
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
