import React from 'react'

export default class Title extends React.Component{

    renderHeader(){
        if (!this.props.isConnected || !this.props.roomSelected){
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
                            <a class="mdl-navigation__link" href="">Browse our channels</a>
                            <a class="mdl-navigation__link" href="">Connected Users</a>
                            <a class="mdl-navigation__link" href="">Create room</a>
                            <a class="mdl-navigation__link" href="">Disconnect</a>
                        </nav>
                    </div>
                    <main class="mdl-layout__content">
                        <div class="page-content"></div>
                    </main>
                </div>
            )
        }
    }
    render(){
        return(this.renderHeader())
    }
}
