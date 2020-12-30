import React from 'react'
import 'asset/views.css';
import LoadingOverlay from 'react-loading-overlay';

import Snackbar from '@material-ui/core/Snackbar';

import { CategorySelectionShow } from 'components/StockList/CategorySelectionShow';
import { StockContentsImageShow } from 'components/StockList/StockContentsImageShow';
import { StockContentsListShow } from 'components/StockList/StockContentsListShow';
import { StockDetailsUpdateModalView } from 'components/StockList/StockDetailsUpdateModalView';
import { StockListSettingButtonsShow } from 'components/StockList/StockListSettingButtonsShow';
import VisibleViewString from 'components/StockList/VisibleViewString';
import AccessFireBase from 'components/AccessFirebase';

const MAX_USER_ITEMS = 50

export class StockList extends React.Component{ 
  /*
  props: 
    userID: ユーザー固有ID
   */
  constructor(props){
    super(props)
    this.isUserDataLoaded = false

    this.state = {
      data_list: [], // 全アイテムの[id, data]のリスト
      show_list: [], // 表示するアイテムの[id, data]のリスト
      category_map: {},

      isCategoryShow: true,
      selectedCategory: "all",

      detailsItemID: null,
      //detailsItem: null,
      addItem: false,
      modalopen: false,
      current_view: VisibleViewString.image,

      loading: true,
      feedbackopen: false,

      error_code: null,
    }

  }
  componentDidMount() {
    this.docs.get()
  }


  check = {
    getUserData: () => {
    // Note: state update but not render
    if(!this.isUserDataLoaded){
        this.isUserDataLoaded = true
        this.docs.get()
      }  
    },
    canUserAddDocs: () => {
      if(this.state.data_list.length <= MAX_USER_ITEMS){
        return true
      }
      else{
        return false
      }  
    }
  }

  docs = {
    get: async () =>  {
      if(this.props.userID){
        Promise.all([
          AccessFireBase.getCategoryMap(this.props.userID), 
          AccessFireBase.getItemList(this.props.userID)
        ]).then((success) => {
          let [categoryMap, pairOfItemIDAndData] = success
          this.setState({data_list: pairOfItemIDAndData, show_list : pairOfItemIDAndData, category_map: categoryMap, loading: false})
        }).catch((error) => {
          this.setState({data_list: [], show_list : [], category_map: {}, loading: false, error_code: error.error_code}) 
        })
      }  
    },
    delete: async (itemID) => {
      if(this.props.userID){
        let delete_item = this.state.data_list.filter(value => value[0] === itemID)[0]

        await AccessFireBase.deleteItemContent(this.props.userID, delete_item[0], delete_item[1])

        let newDataList = this.state.data_list.filter(value => value[0] !== itemID)
        let newShowList = this.state.show_list.filter(value => value[0] !== itemID)

        this.setState({data_list: newDataList, show_list: newShowList})
      }
    },
    details: (itemID) => {
      this.setState({detailsItemID: itemID, modalopen:true})      
    }
  }

  modals = {
    addDocModalOpen: () => {
      this.setState({addItem: true, modalopen: true})
    },
    handleClose: () => {
      this.setState({
        detailsItemID: null,
        addItem: false,
        modalopen: false,
      })  
    },
    handleSubmitClose: async (props) => {
      if(!props.error_code){
        let newList = this.state.data_list.slice()
        // Add
        if(this.state.addItem){
          newList.push([props.item_id, props])
        }
        // Update
        else if(this.state.detailsItemID){
          newList = this.state.data_list.map(item => {
            if(item[0] === this.state.detailsItemID){
              return [this.state.detailsItemID, props]
            }else{
              return item
            }
          })
        }
        this.setState({data_list: newList, show_list: newList, category_map: props.category_map, selectedCategory: "all"})
      }
      this.modals.handleClose()  
    }
  }

  feedback = {
    handleClose: () => {
      this.setState({
        feedbackopen: false
      })
    }
  }

  view = {
    columnChange: () => {
      let currentView = this.state.current_view
      let viewNumber = Object.keys(VisibleViewString).length
      if(currentView+1 < viewNumber){
        this.setState({current_view: (currentView+1)})      
      }
      else{
        this.setState({current_view: 0})
      }  
    },
    categoryChanged: (new_category_map) => {
      this.setState({category_map: new_category_map})
    },
    refresh: () => {
      this.docs.get()
      this.categorySelect.all()
    }
  }

  categorySelect = {
    value: (val) => {
      if(val === this.state.selectedCategory){
        this.categorySelect.all()
      }
      else{
        let selected_list = this.state.data_list.filter(value => {
          /*
          if((value[1]).category_id && (value[1].category_id).length > 0){
            // 各項目のcategory_idのリストの中に、検索したいカテゴリIDが含まれているかどうかチェック
            return ((value[1].category_id).indexOf(val) >= 0)
          }
          */
         return value[1].category_id === val
        })
        this.setState({show_list: selected_list, selectedCategory: val})    
      }
    },
    all: () => {
      this.setState({show_list: this.state.data_list, selectedCategory: " "})
    },
    none: () => {
      let selected_list = this.state.data_list.filter(value => {
        // カテゴリIDが存在しないときまたは空白のとき
        return !(value[1]).category_id || ((value[1]).category_id && (value[1].category_id) === "")
        //return !(value[1]).category_id || ((value[1]).category_id && (value[1].category_id).length == 0)
      })
      this.setState({show_list: selected_list, selectedCategory: ""})  
    }
  }

  render(){
    if(!this.isUserDataLoaded && this.props.userID){
      this.check.getUserData()
      return (
        <LoadingOverlay
        active={true}
        spinner
        text='Loading...'
      >
        <div style={{ height: '100vh', width: '100vw',   backgroundImage: `url("/image/top.jpg")` }}></div>
      </ LoadingOverlay>
      )
    }

    else{
      return (
      <div className="stock-list-root">

        <CategorySelectionShow 
          category_map={this.state.category_map} 
          data_list={this.state.data_list} 
          show_list={this.state.show_list} 
          selectedCategory={this.state.selectedCategory} 
          handleCategorySelect={this.categorySelect.value} 
          handleCategorySelectNone={this.categorySelect.none} 
          handleCategorySelectAll={this.categorySelect.all}
        />

        <StockListSettingButtonsShow 
          current_view={this.state.current_view} 
          settingColumn={this.view.columnChange} 
          addDoc={this.modals.addDocModalOpen}
        />

        <StockContentsListShow 
          visible={this.state.current_view===VisibleViewString.list} 
          show_list={this.state.show_list} 
          category_map={this.state.category_map}
          detailsDoc={this.docs.details} 
          deleteDoc={this.docs.delete} 
        />

        <StockContentsImageShow 
          visible={this.state.current_view===VisibleViewString.image} 
          show_list={this.state.show_list} 
          detailsDoc={this.docs.details}
          addDoc={this.modals.addDocModalOpen}
        />      

        <StockDetailsUpdateModalView
          userID={this.props.userID}
          detailsItemID={this.state.detailsItemID}
          wantToAddItem={this.state.addItem}
          modalOpen={this.state.modalopen}
          category_map={this.state.category_map}
          canUserAddDocs={this.check.canUserAddDocs}
          handleClose={this.modals.handleClose}
          handleSubmitClose={this.modals.handleSubmitClose}
          categoryChanged={this.view.categoryChanged}
        />
      </div>
      )
    }
  }
}
