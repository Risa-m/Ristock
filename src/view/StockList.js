import React from 'react'
import firebase, { db } from '../firebase'
import 'asset/views.css';

import { CategorySelectionShow } from 'components/StockList/CategorySelectionShow';
import { StockContentsImageShow } from 'components/StockList/StockContentsImageShow';
import { StockContentsListShow } from 'components/StockList/StockContentsListShow';
import { StockDetailsUpdateModalView } from 'components/StockList/StockDetailsUpdateModalView';
import { StockListSettingButtonsShow } from 'components/StockList/StockListSettingButtonsShow';
import VisibleViewString from 'components/StockList/VisibleViewString';

const MAX_USER_ITEMS = 1000

export class StockList extends React.Component{ 
  /*
  props: 
    userID: ユーザー固有ID
   */
  constructor(props){
    super(props)

    this.state = {
      isUserDataLoaded: false,
      data_list: [], // 全アイテムの[id, data]のリスト
      show_list: [], // 表示するアイテムの[id, data]のリスト
      category_list: [""], // 全カテゴリのリスト
      category_map: {},

      isCategoryShow: true,
      selectedCategory: "all",

      detailsItemID: null,
      //detailsItem: null,
      addItem: false,
      modalopen: false,
      current_view: VisibleViewString.image,
    }

  }
  componentDidMount() {
    this.docs.get()
  }


  check = {
    getUserData: () => {
    // Note: state update but not render
    if(!this.state.isUserDataLoaded){
        this.state.isUserDataLoaded = true
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
        var categoryRef = db.collection('users').doc(this.props.userID)
        let categoryDoc = await categoryRef.get()
        let categoryList = (categoryDoc.data()).category || [""]
        let categoryMap = (categoryDoc.data()).category_map || {}
  
        let colRef = db.collection('users')
                        .doc(this.props.userID)
                        .collection('stock_items')
        let snapshots = await colRef.get()
        let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
        this.setState({data_list: docs, show_list : docs, category_map: categoryMap, category_list: categoryList}) 
      }  
    },
    delete: (docID) => {
      if(this.props.userID){
        let delete_item = this.state.data_list.filter(value => value[0] === docID)[0]
        if(delete_item[1].image_url){
          var deleteRef = firebase.storage().ref().child(`users/${this.props.userID}/${docID}.jpg`);
          deleteRef.delete()
        }
        db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
        let newDataList = this.state.data_list.filter(value => value[0] !== docID)
        let newShowList = this.state.show_list.filter(value => value[0] !== docID)
        this.setState({data_list: newDataList, show_list: newShowList})
      }
    },
    details: (docID) => {
      this.setState({detailsItemID: docID, modalopen:true})      
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
      this.setState({data_list: newList, show_list: newList, category_list: props.category_list, category_map: props.category_map, selectedCategory: "all"})
      this.modals.handleClose()  
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
    }
  }

  categorySelect = {
    value: (val) => {
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
    if(!this.state.isUserDataLoaded && this.props.userID){
      this.check.getUserData()
    }

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
      />      

      <StockDetailsUpdateModalView
        userID={this.props.userID}
        detailsItemID={this.state.detailsItemID}
        wantToAddItem={this.state.addItem}
        modalOpen={this.state.modalopen}
        category_list={this.state.category_list}
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
