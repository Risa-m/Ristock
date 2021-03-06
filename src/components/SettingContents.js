import React from 'react'
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
      category_map: {},

      error_code: null,
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    //await this.getDocs()
    await this.db.get(this.props.userID)
  }

  db = {
    get: async (userID) => {
      await AccessFireBase.getCategoryMap(userID)
            .then((categoryMap) => {
              this.setState({category_map: categoryMap})
            })
            .catch((error) => {
              this.setState({category_map: {}, error_code: error.error_code})
              this.props.setErrorCode(error.error_code)
            })
    },
    deleteCategory: async (userID, categoryID, categoryMap) => {
      await AccessFireBase.deleteCategoryContent(userID, categoryID, categoryMap)
            .then(newCategoryMap => {
              this.setState({category_map: newCategoryMap})
              this.props.handleSettingChanged()  
            })
            .catch(error => {
              this.setState({error_code: error.error_code})
              this.props.setErrorCode(error.error_code)
            })
    },
    changeCategoryName: async (userID, categoryID, categoryName, categoryMap) => {
    // todo: 更新失敗した時に表示がもとに戻るようにする
     await AccessFireBase.updateCategoryName(userID, categoryID, categoryName, categoryMap)
          .then(newCategoryMap => {
            console.log(newCategoryMap)
            this.setState({category_map: newCategoryMap})
            this.props.handleSettingChanged()
          })
          .catch(error => {
            this.setState({error_code: error.error_code})
            this.props.setErrorCode(error.error_code)
          })
    },
    createNewCategory: async (userID, categoryName, categoryMap) => {
      let search = Object.keys(categoryMap).filter(val => categoryMap[val] === categoryName)
      if(categoryName !== "" && search.length === 0){
        await AccessFireBase.createCategoryContent(userID, categoryName, this.state.category_map)
              .then(success => {
                let [_, newCategoryMap] = success
                this.setState({category_map: newCategoryMap})
                this.props.handleSettingChanged()  
              })
              .catch(error => {
                this.setState({error_code: error.error_code})
                this.props.setErrorCode(error.error_code)
              })
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

