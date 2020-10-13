import React, {useState} from 'react'
import firebase, { db } from '../firebase'
import 'asset/views.css';
import PropTypes from 'prop-types';
import LoadingOverlay from 'react-loading-overlay';

import Snackbar from '@material-ui/core/Snackbar';

import { CategorySelectionShow } from 'components/StockList/CategorySelectionShow';
import { StockContentsImageShow } from 'components/StockList/StockContentsImageShow';
import { StockContentsListShow } from 'components/StockList/StockContentsListShow';
import { StockDetailsUpdateModalView } from 'components/StockList/StockDetailsUpdateModalView';
import { StockListSettingButtonsShow } from 'components/StockList/StockListSettingButtonsShow';
import VisibleViewString from 'components/StockList/VisibleViewString';

const MAX_USER_ITEMS = 50

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

      modal_content_id: null,
      modal_content_category_id: null,

      modal_content: {item_id: null, category_id: null},

      loading: true,
      feedbackopen: false,
      errorMessage: ""
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
        await db.collection('users').doc(this.props.userID)
                .get()
                .then((categoryDoc) => {
                  let categoryMap = (categoryDoc.data()).category_map || {}
                  db.collection('users').doc(this.props.userID)
                    .collection('stock_items')
                    .get()
                    .then((snapshots) => {
                      let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
                      this.setState({data_list: docs, show_list : docs, category_map: categoryMap, loading: false})
                    })
                })
                .catch(() => {
                  console.log(ERROR_MESSAGE.DBGetError)
                  this.setState({errorMessage: ERROR_MESSAGE.DBGetError, feedbackopen: true})                                    
                })
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

  submit = {
    handleUpdateSubmit: async (props) => {
      await this.submit.setContentDataFromProp(props)
      await this.db.updateStockItems(this.props.userID, props.item_id, this.state.modal_content)
      await this.db.imageUpload(this.props.userID, props.item_id, this.state.modal_content)
      await this.db.updateCategory(this.props.userID, props.item_id, this.state.modal_content.old_category_id, this.state.modal_content.category_id)  
    },
    handleAddSubmit: async (props) => {
      await this.submit.setContentDataFromProp(props)
      await this.db.addStockItems(this.props.userID, this.state.modal_content)
      await this.db.imageUpload(this.props.userID, this.state.modal_content.item_id, this.state.modal_content)
      await this.db.addCategory(this.props.userID, this.state.modal_content.item_id, this.state.modal_content.category_id)
    },
    setContentDataFromProp: (props) => {
        let props_map = 
        { item_id: props.item_id,
          name: props.name,
          modelNumber: props.modelNumber, 
          size: props.size,
          color: props.color,
          stockNumber: props.stockNumber,
          price: props.price,
          lotSize: props.lotSize,
          category: props.category, 
          newCategoryName: props.newCategoryName,
          old_category_id: props.old_category_id,
          category_id: props.category_id,
          image_url: props.image_url, 
          local_image: props.local_image,
          local_image_src: props.local_image_src,
          category_map: props.category_map,
        }
        this.setState({modal_content: props_map})
    }
  }

  db = {
    imageUpload: async (userID, itemID, content) => {
      // 画像ファイルの保存
      let itemRef = db.collection('users')
                      .doc(userID)
                      .collection('stock_items')
                      .doc(itemID)

      const imageUploadPromise = new Promise((resolve, reject) => {
        if(content.local_image){
          let storageRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`);
          storageRef.put(content.local_image)
          .then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
              itemRef.set({image_url: url}, { merge: true });
              let new_content = content
              new_content["image_url"] = url

              this.setState({modal_content: new_content})
              resolve()
            })
          });
        }
        else{
          resolve()
        }
      })
      await imageUploadPromise.catch(() => {
        console.log(ERROR_MESSAGE.ImageUploadError)
        this.setState({errorMessage: ERROR_MESSAGE.ImageUploadError, feedbackopen: true})
      })
    },
    addStockItems: async (userID, content) => {
      await this.db.checkCreateCategory(userID, content.category_map, content.newCategoryName)
      let addDoc = db.collection('users')
                    .doc(userID)
                    .collection('stock_items')
      await addDoc.add({
        name: content.name,
        modelNumber: content.modelNumber,
        size: content.size,
        color: content.color,
        stockNumber: content.stockNumber,
        price: content.price,
        lotSize: content.lotSize,
        category: content.category,
        category_id: content.category_id,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }).then(ref => {
        let new_content = content
        new_content["item_id"] = ref.id
        this.setState({modal_content: new_content})  
      })
    },
    updateStockItems: async (userID, itemID, content) => {
      await this.db.checkCreateCategory(userID, content.category_map, content.newCategoryName)
      let itemRef = db.collection('users')
                      .doc(userID)
                      .collection('stock_items')
                      .doc(itemID)
      await itemRef.update({
        name: content.name,
        modelNumber: content.modelNumber,
        size: content.size,
        color: content.color,
        stockNumber: content.stockNumber,
        price: content.price,
        lotSize: content.lotSize,
        category: content.category,
        category_id: content.category_id,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      })
    },
    addCategory: async (userID, itemID, categoryID) => {
      // カテゴリ側にitemIDを追加
      if(categoryID !== ""){
        let newCategoryRef = db.collection('users').doc(userID)
                              .collection('categories').doc(categoryID)
        let newCetegoryData = (await newCategoryRef.get()).data()
        // DBからそのカテゴリが登録されているitemIDのリストを取得
        let newCetegoryItems = newCetegoryData.item_id || []
        newCetegoryItems.push(itemID)
        newCategoryRef.update({
          item_id: newCetegoryItems,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        })
      }
    },
    updateCategory: async (userID, itemID, oldCategoryID, newcategoryID) => {
      // 旧カテゴリ側からitemIDを削除し、新カテゴリ側にitemIDを追加
      // カテゴリ側にitemIDを登録
      if(oldCategoryID !== newcategoryID){
        if(oldCategoryID !== ""){
          // もとのカテゴリからitemIDを削除
          let oldCategoryRef = db.collection('users').doc(userID)
                                .collection('categories').doc(oldCategoryID)
          let oldCetegoryData = (await oldCategoryRef.get()).data()
          // DBからそのカテゴリが登録されているitemIDのリストを取得し、該当のitemIDを削除
          let oldCategoryItems = oldCetegoryData.item_id || []
          oldCategoryItems = oldCategoryItems.filter(item => item !== itemID)
          oldCategoryRef.update({
            item_id: oldCategoryItems,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()    
          })
        }

        // 新しいカテゴリにitemIDを追加
        let newCategoryRef = db.collection('users').doc(userID)
                              .collection('categories').doc(newcategoryID)
        let newCetegoryData = (await newCategoryRef.get()).data()
        // DBからそのカテゴリが登録されているitemIDのリストを取得
        let newCategoryItems = newCetegoryData.item_id || []
        newCategoryItems.push(itemID)
        newCategoryRef.update({
          item_id: newCategoryItems,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        })
      }
    },
    checkCreateCategory: async (userID, category_map, categoryName) => {
      // カテゴリーが入力済みで未保存である場合に保存し、同名のカテゴリが既に存在している場合はそこに追加
      if(categoryName !== ""){
        let search = Object.keys(category_map).filter(val => category_map[val] === categoryName)
        if(search.length === 0){
          await this.db.createCategory(userID, categoryName)
        }
        else {
          this.setState({category_id: search[0]})
        }
      }
    },
    createCategory: async (userID, categoryName, content) => {
      // カテゴリの新規追加
      // 既に同名のカテゴリがある場合はそちらを優先
      let search = Object.keys(content.category_map).filter(val => content.category_map[val] === categoryName)
      if(search.length !== 0){
        this.setState({category_id: search[0]})
      }else {
        // 新しいカテゴリをDBに登録し、categoryIDを作成
        let userRef = db.collection('users').doc(userID)
        let categoryRef = userRef.collection('categories')
        await categoryRef.add({
          name: categoryName,
          item_id: [],
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        }).then(ref => {
          // カテゴリ名とIDの紐づけ
            let new_category_map = JSON.parse(JSON.stringify(content.category_map)) // deep copy
            // category_mapに[category_id, category_name]を追加
            let new_category_id = ref.id
            new_category_map[new_category_id] = categoryName
            userRef.update({ category_map: new_category_map })

            let new_content = JSON.parse(JSON.stringify(content)) // deep copy
            new_content["category_map"] = new_category_map
            new_content["category_id"] = new_category_id

            this.setState({modal_content: new_content})
            this.props.categoryChanged(new_category_map)
        })
      }
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
        await this.submit.handleAddSubmit(props)
        newList.push([props.item_id, this.state.modal_content])
      }
      // Update
      else if(this.state.detailsItemID){
        await this.submit.handleUpdateSubmit(props)
        newList = this.state.data_list.map(item => {
          if(item[0] === this.state.detailsItemID){
            return [this.state.detailsItemID, this.state.modal_content]
          }else{
            return item
          }
        })
      }
      this.setState({data_list: newList, show_list: newList, selectedCategory: "all"})
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
    if(!this.state.isUserDataLoaded && this.props.userID){
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
          createCategory={this.db.createCategory}
        />

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.feedbackopen && this.state.errorMessage !== ""}
          onClose={this.feedback.handleClose}
          message={this.state.errorMessage}
          autoHideDuration={10000}
        />
      </div>
      )
    }
  }
}

const ERROR_MESSAGE = {
  ImageUploadError: "画像の保存に失敗しました。",
  DBGetError: "データの取得に失敗しました。",
  DBSaveError: "保存に失敗しました。",
}
