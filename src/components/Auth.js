import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from '@material-ui/core';
import firebase, { db } from '../firebase';
//import LoadingOverlay from 'react-loading-overlay';

class Auth extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      signinCheck: false, //ログインチェックが完了してるか
      signedIn: false, //ログインしてるか
      user: null,
      userID: null
    }
  }

    _isMounted = false; //unmountを判断（エラー防止用）

    componentDidMount = () => {
        //mountされてる
        this._isMounted = true;

        //ログインしてるかどうかチェック
        firebase.auth().onAuthStateChanged(user => {
          // ログインしているとき
          if (user) {
            // IDを登録
            let usersDocRef = db.collection('users').doc(user.uid)
            usersDocRef.get().then(doc => {
              if(!doc.exists){
                usersDocRef.set({
                  uid: user.uid,
                  name: user.displayName,
                })
              }
            })
            if (this._isMounted) {
              this.setState({
                  signinCheck: true,
                  signedIn: true,
                  user: user,
                  userID: user.uid
              });
              this.props.setUser(user)
              this.props.setUserID(user.uid)
              console.log("mounted && signed")
              }
            } else {
                //してない
                if (this._isMounted) {
                    this.setState({
                        signinCheck: true,
                        signedIn: false,
                    });
                    console.log("mounted && not signed")
                }
            }
        })
    }
    login = () => {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
    }

    logout = () => {
      firebase.auth().signOut()
      this.props.setUser(null)
      this.props.setUserID(null)
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    render() {
        //チェックが終わってないとき（ローディング表示）
        if (!this.state.signinCheck) {

          /*
            return (
                <LoadingOverlay
                    active={true}
                    spinner
                    text='Loading...'
                >
                    <div style={{ height: '100vh', width: '100vw' }}></div>
                </ LoadingOverlay>
            );
            */
           return (
             <p>loading...</p>
           )
        }

        //チェックが終わりかつ
        if (this.state.signedIn) {
            //サインインしてるとき（そのまま表示）
            console.log("isSigned")

            return (
            <div>
              {this.props.children
              }
            </div>
            );
        } else {
            //してないとき（ログイン画面にリダイレクト）
            this.login()
            console.log("auth")
            return <p>please login. </p>
        }
    }
}

export default Auth;