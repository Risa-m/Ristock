import React from 'react'
import { Link } from "react-router-dom";
import './views.css';
import Button from '@material-ui/core/Button';

export class Home extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      user: this.props.user,
      userID: this.props.userID,
    }
  }

  render(){
    return (
      <div className="home-root">
        <div className="home-background"></div>
          <div className="home-top-message">
          <h1>Ristockで<br/>いつでも、さっと<br/>在庫を確認</h1>
          {/*<h2>Enjoy Handmade with Ristock!</h2>*/}
          <p><span style={{color: "#7F3762"}}>Ristock</span>はハンドメイドが好きな全ての人のための在庫管理アプリです。<br/>PC、タブレット、スマートフォンからお使いになれます。{/*ビーズ、金具パーツ、糸、布、リボン、花材、などなど*/}</p>
          {
          <Link to="/signup">
            <Button variant="contained" style={{fontSize: "1.05em", fontWeight: "500", color: "#7c8993", backgroundColor: "#fff", textTransform: 'none'}}><img src="icon.png" alt="Ristock" size="large" style={{width: "40px", marginRight: "8px"}}/> &nbsp;Start Ristock</Button>
          </Link>
          }
        </div>
      </div>
      )
    
  }
}


