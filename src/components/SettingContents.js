import React from 'react'
import firebase, { db } from '../firebase'
import 'asset/components.css'

import SettingViewChoice from 'components/Settings/SettingViewChoice'
import { SettingTopView } from 'components/Settings/SettingTopView'
import { SettingOfCategoryView } from 'components/Settings/SettingOfCategoryView'

import AccessFireBase from 'components/AccessFirebase'

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
      let categoryMap = await AccessFireBase.getCategoryContent(userID)
      this.setState({category_map: categoryMap})
    },
    deleteCategory: async (userID, categoryID, categoryMap) => {
      let newCategoryMap = await AccessFireBase.deleteCategoryContent(userID, categoryID, categoryMap)
      this.setState({category_map: newCategoryMap})
      this.props.handleSettingChanged()
    },
    changeCategoryName: async (userID, categoryID, categoryName, categoryMap) => {
     let newCategoryMap = await AccessFireBase.updateCategoryName(userID, categoryID, categoryName, categoryMap)
     this.setState({category_map: newCategoryMap})
     this.props.handleSettingChanged()
    },
    createNewCategory: async (userID, categoryName, categoryMap) => {
      let search = Object.keys(categoryMap).filter(val => categoryMap[val] === categoryName)
      if(categoryName !== "" && search.length === 0){
        let [_, newCategoryMap] = await AccessFireBase.createCategoryContent(userID, categoryName, this.state.category_map)
        this.setState({category_map: newCategoryMap})
        this.props.handleSettingChanged()
      }
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
            viewChange={this.viewChange}
            handleCategoryDelete={this.db.deleteCategory}
            handleCategoryRename={this.db.changeCategoryName}
            handleCategoryCreate={this.db.createNewCategory}
            />
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

