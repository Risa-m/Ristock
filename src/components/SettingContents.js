import React from 'react'
import { db } from '../firebase'
import 'asset/components.css'

import SettingViewChoice from 'components/Settings/SettingViewChoice'
import { SettingTopView } from 'components/Settings/SettingTopView'
import { SettingOfCategoryView } from 'components/Settings/SettingOfCategoryView'

export class SettingContents extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      item_id: props.item_id,
      data: null,
      visible: SettingViewChoice.top,
      category_list: [""],
      category_map: {},
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    //await this.getDocs()
    await this.db.get(this.props.userID)
  }

  db = {
    get: async (userID) => {
      if(this.props.userID){
        // DBからカテゴリリストの取得
        var categoryRef = db.collection('users').doc(userID)
        let userDoc = await categoryRef.get()
        let categoryList = (userDoc.data()).category || [""]  
        let categoryMap = (userDoc.data()).category_map || {}
        this.setState({category_list: categoryList, category_map: categoryMap})
      }  
    },
    deleteCategory: async (userID, categoryID) => {
      let new_category_map = JSON.parse(JSON.stringify(this.state.category_map)) // deep copy
      delete new_category_map[categoryID]
      this.setState({category_map: new_category_map})

      // category_mapからcategory_idを削除
      await db.collection('users').doc(userID)
              .update({category_map: new_category_map})
  
      // item側からcategory_idを削除
      // category_idが削除したいものと一致しているitemを取得
      let ItemContainsCategoryShots = await db.collection('users')
                                              .doc(userID)
                                              .collection('stock_items')
                                              .where('category_id', '==', categoryID)
                                              .get()
      if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty){
        ItemContainsCategoryShots.forEach(doc => {
          doc.ref.update({
            category_id: ""
          })
        })  
      }
      // カテゴリのドキュメントをDBから削除
      await db.collection('users').doc(userID)
              .collection('categories').doc(categoryID).delete()
  
      this.props.handleSettingChanged()
    },
    changeCategoryName: async () => {

    }

  }
  // form が変更されたとき、stateも更新
  handleChanege = (property, event) => {
    this.setState({ [property] : event.target.value})
  }

  viewChange = (new_view) => {
    this.setState({visible: new_view})
  }

  render(){
    if(this.props.userID){
      // カテゴリの設定
      if(this.state.visible === SettingViewChoice.top){
        return (
          <SettingTopView viewChange={this.viewChange}/>
        )
      }
      else if(this.state.visible === SettingViewChoice.category){
        return (
          <SettingOfCategoryView 
            userID={this.props.userID}
            category_map={this.state.category_map} 
            handleCategoryDelete={this.db.deleteCategory}/>
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

