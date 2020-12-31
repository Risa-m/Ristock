import React from 'react'
import 'asset/components.css'

import { resizeImage } from 'components/ResizeImage';
import { StockContentGridView } from 'components/StockContents/StockContentGridView';
import DBTemplate from 'components/DBTemplate';
import AccessFireBase from 'components/AccessFirebase';

import Button from '@material-ui/core/Button';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';


const MAX_CATEGORY_SIZE = 10
const IMAGE_MAX_SIZE = 512

export class StockContents extends React.Component{
  /*
  props: 
    item_id: 詳細表示するアイテムの固有ID
    userID: ユーザー固有ID
    handleClose: Submitしたときにデータを渡す
  */
  constructor(props){
    super(props)

    this.state = {
      item_id: props.item_id,
      isLoaded: false,

      ...DBTemplate.content_none,

      newCategoryName: "",

      local_image: null,
      local_image_src: null,

      category_map: this.props.category_map, // 全categoryの{id: name}

      submitButtonCheck: false,

      error_code: null
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    await this.db.getDocs(this.props.userID, this.state.item_id)
  }

  callbacks = {
    handleChanege: (property, event) => {
      // form が変更されたとき、stateも更新
      this.setState({[property]: event.target.value})
    },
    handleCategoryChanege: (event) => {
      //let new_id = Object.keys(this.state.category_map).filter(val => val === event.target.value)
      this.setState({category : this.state.category_map[event.target.value], category_id: event.target.value})
    },
    handleNewCategoryNameChange: (categoryName) => {
      this.setState({newCategoryName: categoryName})
    },
    handleImageChange: async (event) => {
      const { imageFile, imageUri } = await resizeImage(event, IMAGE_MAX_SIZE)
      this.setState({
        local_image: imageFile,
        local_image_src: imageUri,
      })  
    }
  
  }

  db = {
    getDocs: async (userID, itemID) => {
      await AccessFireBase.getItemContent(userID, itemID)
            .then((contentData) => {
              this.setState(DBTemplate.get_content(contentData, this.state.category_map))
              this.setState({isLoaded: true})                          
            })
            .catch((errorData) => {
              this.setState(DBTemplate.get_content(errorData, this.state.category_map))
              this.setState({isLoaded: true, error_code: errorData.error_code})
            })
    },
    imageUpload: async (userID, itemID) => {      
     if(this.state.local_image){
        await AccessFireBase.imageUploadToStrage(userID, itemID, this.state.local_image)
        .then((imageURL) => 
          AccessFireBase.imageUrlRegister(userID, itemID, imageURL)
        ).then((imageURL) => {
          this.setState({image_url: imageURL})
        }).catch((error) => {
          this.setState({image_url: "", error_code: error.error_code})
        })
     }
    },
    addStockItems: async (userID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      await AccessFireBase.addItemContent(userID, this.state)
      .then((newContentItemID) => {
        this.setState({item_id: newContentItemID})
      })
      .catch((error) => {
        this.setState({error_code: error.error_code})
      })
    },
    updateStockItems: async (userID, itemID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      await AccessFireBase.updateItemContent(userID, itemID, this.state)
      .catch((error) => {
        this.setState({error_code: error.error_code})
      })
    },
    setCategory: async (userID, itemID, oldCategoryID, newCategoryID) => {
      if(oldCategoryID !== newCategoryID || oldCategoryID === ""){
        if(oldCategoryID !== ""){
          await AccessFireBase.getItemIDListOfCategory(userID, oldCategoryID)
                .then((itemIDListOfOldCategory) => {
                  itemIDListOfOldCategory.filter(item => item !== itemID)
                  return AccessFireBase.updateItemIDListOfCategory(userID, oldCategoryID, itemIDListOfOldCategory)
                })
                .catch((error) => {
                  this.setState({error_code: error.error_code})
                })
        }
        if(newCategoryID !== ""){
          await AccessFireBase.getItemIDListOfCategory(userID, newCategoryID)
                .then((itemIDListOfNewCategory) => {
                  itemIDListOfNewCategory.push(itemID)
                  return AccessFireBase.updateItemIDListOfCategory(userID, newCategoryID, itemIDListOfNewCategory)
                })
                .catch((error) => {
                  this.setState({error_code: error.error_code})
                })
        }
      }
    },
    checkCreateCategory: async (userID, category_map, categoryName) => {
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
    createCategory: async (userID, categoryName) => {
      let search = Object.keys(this.state.category_map).filter(val => this.state.category_map[val] === categoryName)
      if(search.length === 0){
        let [categoryID, newCategoryMap] = await AccessFireBase.createCategoryContent(userID, categoryName, this.state.category_map)
        this.setState({category_map: newCategoryMap, category_id: categoryID, category: categoryName})
        this.props.categoryChanged(newCategoryMap)
      }else{
        this.setState({category_id: search[0]})
      }
    }
  }

  handleSubmit = async (event) => {

    this.setState({submitButtonCheck: true})

    if(this.state.item_id){
      await this.db.updateStockItems(this.props.userID, this.state.item_id)
    }else {
      await this.db.addStockItems(this.props.userID)
    }
    await this.db.imageUpload(this.props.userID, this.state.item_id)
    await this.db.setCategory(this.props.userID, this.state.item_id, this.state.old_category_id, this.state.category_id)

    this.props.handleClose(this.state)

  }

  createNewCategory = async (categoryName) => {
    if(categoryName !== "" && Object.keys(this.state.category_map).length < MAX_CATEGORY_SIZE){

      this.setState({category: categoryName})      

      await this.db.createCategory(this.props.userID, categoryName)
    }
  }

  
  phonePlusMinusTemplate = (props) => {
    return (
      <div className="stock-form-phone-view">
        <div className="stock-form-phone-view-item" onClick={() => this.setState({[props.property]: (this.state[props.property]+1)})}><AddRoundedIcon /></div>
        <div className="stock-form-phone-view-item" onClick={() => (this.state[props.property] > 0)? this.setState({[props.property]: (this.state[props.property]-1)}):null}><RemoveRoundedIcon /></div>
      </div>
    )
  }


  render(){
    if(this.props.userID && this.state.isLoaded){
      return (
        <div className="stock-detail-root">

        <StockContentGridView 
          handleValueChanege={this.callbacks.handleChanege}
          createNewCategory={this.createNewCategory}
          handleValueChanege={this.callbacks.handleChanege}
          handleCategoryChanege={this.callbacks.handleCategoryChanege}
          imageChangeHandler={this.callbacks.handleImageChange}
          handleNewCategoryNameChange={this.callbacks.handleNewCategoryNameChange}
          {...this.state}
        />
        <div className="stock-content-submit-button">
          <Button 
          variant="outlined" 
          onClick={this.handleSubmit} 
          disabled={!(this.state.name) || this.state.submitButtonCheck}
          >
            Save
          </Button>
        </div>

      </div>
      )
    }else{
      return (
        <div className="stock-detail-root">
        </div>
        )    
    }
  }
}

