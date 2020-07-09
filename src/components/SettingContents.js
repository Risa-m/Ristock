import React from 'react'
import firebase, { db } from '../firebase'
import 'asset/components.css'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CategoryIcon from '@material-ui/icons/Category';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

import Chip from '@material-ui/core/Chip';

const MAX_CATEGORY_SIZE = 100
const MAX_TEXT_INPUT_LENGTH = 20

export class SettingContents extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      item_id: props.item_id,
      data: null,
      visible: settingChoice.top,
      category_list: [""],
      category_map: {},
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    await this.getDocs()
  }

  async getDocs(){
    if(this.props.userID){
      // DBからカテゴリリストの取得
      var categoryRef = db.collection('users').doc(this.props.userID)
      let userDoc = await categoryRef.get()
      let categoryList = (userDoc.data()).category || [""]  
      let categoryMap = (userDoc.data()).category_map || {}
      this.setState({category_list: categoryList, category_map: categoryMap})
    }
  }

  // form が変更されたとき、stateも更新
  handleChanege(property, event) {
    this.setState({ [property] : event.target.value})
  }

  viewChange(new_view){
    this.setState({visible: new_view})
  }

  async handleCategoryDelete(categoryID){
    let new_category_map = this.state.category_map
    delete new_category_map[categoryID]
    this.setState({category_map: new_category_map})
    // category_mapからcategory_idを削除
    await db.collection('users').doc(this.props.userID).update({category_map: new_category_map})

    // item側からcategory_idを削除
    let ItemContainsCategoryShots = await db.collection('users').doc(this.props.userID).collection('stock_items').where('category_id', '==', categoryID).get()
    if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty)
    ItemContainsCategoryShots.forEach(doc => {
      doc.ref.update({
        category_id: ""
      })
    })
    // カテゴリのドキュメントをDBから削除
    await db.collection('users').doc(this.props.userID).collection('categories').doc(categoryID).delete()

    this.props.handleSettingChanged()
  }

  addCategoryHandler(){

  }



  render(){
    if(this.props.userID){
      // カテゴリの設定
      if(this.state.visible === settingChoice.top){
        return (
          <>
            <List component="nav" aria-label="">
              <ListItem button onClick={this.viewChange.bind(this, settingChoice.category)}>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText primary="Category Setting" />
              </ListItem>
            </List>
          </>
        )
      }
      else if(this.state.visible === settingChoice.category){
        return (
          <div className="setting-category-chips">
            {Object.keys(this.state.category_map).map((val, idx) => (
            (val)?
            <Chip label={this.state.category_map[val]} variant={"default"} key={idx} color="primary" onDelete={this.handleCategoryDelete.bind(this, val)}/>
            :null
            ))}
          {//<Chip icon={<AddIcon/>} label="Add" onClick={this.addCategoryHandler.bind(this)} style={{maxWidth: "100%", padding: "0"}}/>
          }
          </div>
        )
      }
      else{
        return (
          <>
          </>
        )
      }
    }
    return (
      <></>
    )
  }
}


const settingChoice = {
  top: 0,
  category: 1,
}