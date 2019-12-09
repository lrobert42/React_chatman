import React from 'react'

export default class LoginScreen extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            screen: "login",
            denied:false,
            username:'',
            password:''
        }
        this.switchLoginRegister = this.switchLoginRegister.bind(this)
        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    userLogin(credentials){
        this.props.socket.emit('new_client', credentials)
        this.props.socket.on('connection_approved', user =>{
            this.props.userConnected(user)
            })

        this.props.socket.on('connection_denied', () =>{
            this.setState({
                denied:true
            })
        })
        this.props.socket.on('already_registered', username =>{
            alert("This username is already registered")
        })
    }

    userRegistration(credentials){
        this.props.socket.emit('registration_asked', credentials)
        this.props.socket.on('connection_approved', user =>{
            this.props.userConnected(user)
        })
    }

    switchLoginRegister(event){// TODO:
        if (event.target.value === "login"){
            if (this.state.screen === "login")
            {
                this.validateInputAndSubmit()
            }
            else {
                this.setState({
                    screen: "login",
                    denied: false
                })
            }
        }
        else{
            if (this.state.screen === "register"){
                this.validateInputAndSubmit()
            }
            else {
                this.setState({
                    screen: "register",
                    denied: false
                })
            }
        }
    }

    handleUsernameChange(event){
        this.setState({
            username: event.target.value
        })
    }

    handlePasswordChange(event){
        this.setState({
            password:event.target.value
        })
    }

    validateInputAndSubmit(){
        if (this.state.username.trim() !== '' && this.state.password.trim() !== ''){
            let credentials = {
                username:this.state.username,
                password:this.state.password
            }
            this.setState({
                username:'',
                password:''
            }, function(){
                    this.state.screen === "login"? this.userLogin(credentials) : this.userRegistration(credentials)
            })
        }
    }

    handleSubmit(event){
        console.log(event)
        this.validateInputAndSubmit()
        event.preventDefault();
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    render(){
        return(
            <div className="login_form">
            <h1 className="form_title">{this.capitalizeFirstLetter(this.state.screen)}</h1>
                <form
                onSubmit = {this.handleSubmit}>
                    <input className="username_input"
                    type="text"
                    onChange={this.handleUsernameChange}
                    value={this.state.username}
                    placeholder="Username"/>
                </form>
                <form className=" w3-input password_input"
                    onSubmit={this.handleSubmit}>
                    <input
                    onChange={this.handlePasswordChange}
                    value={this.state.password}
                    placeholder="Password"
                    type="password"/>
                </form>
                <button
                    className = "form_button"
                    onClick={this.switchLoginRegister}
                    value="login">
                        Log in
                </button>
                <button
                    className = "form_button"
                    onClick={this.switchLoginRegister}
                    value="register">
                        Register
                </button>
            </div>
        )
    }
}
