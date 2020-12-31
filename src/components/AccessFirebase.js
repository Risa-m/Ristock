import firebase, { db } from '../firebase'
import DBTemplate from 'components/DBTemplate';
import ErrorTemplate from 'components/ErrorTemplate';

const TIMEOUT_MS = 10000
const Test_Timeout_ms = 100

const timeout = async (msec) => {
  // timeout_ms ミリ秒後にrejectを実行
  return new Promise((_, reject) => setTimeout(reject, msec))
}
const setAccessTimeout = async (func, timeout_ms) => {
  // Promise.raceは二つ以上のPromiseのうち早い方を戻り値とする
  return Promise.race([func, timeout(timeout_ms)])
}

const AccessFireBase = {
  getItemList: async (userID) => {
    if(userID){
      let itemCollectionRef = db.collection('users').doc(userID)
                                .collection('stock_items')
      let snapshots = await setAccessTimeout(itemCollectionRef.get(), TIMEOUT_MS)
                            .catch(() => 
                              new Promise((_, reject) => {
                                console.log("get error")
                                reject({docs: [], error_code: ErrorTemplate.error_code.DBGetError})
                              })
                            )
      let pairOfItemIDAndDataMap = snapshots.docs.map(doc => [doc.id, doc.data()])
      return pairOfItemIDAndDataMap
    }else {
      return []
    }
  },
  getItemContent: async (userID, itemID) => {
    if(userID && itemID){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      return await setAccessTimeout(itemRef.get(), TIMEOUT_MS)
                    .then((doc) => doc.data())
                    .catch(() => 
                      new Promise((_, reject) => {
                        console.log("get error")
                        reject({...DBTemplate.content_none, error_code: ErrorTemplate.error_code.DBGetError})
                      })
                    )
    }else {
      return DBTemplate.content_none
    }
  },
  getCategoryMap: async (userID) => {
    if(userID){
      let categoryRef = db.collection('users').doc(userID)

      let categoryMap = {}
      return await setAccessTimeout(categoryRef.get(), TIMEOUT_MS)
                  .then((userDoc) => {
                    let userDocData = userDoc.data()
                    if(userDocData){
                      categoryMap = userDocData.category_map || {}
                    }
                    return categoryMap
                  })
                  .catch(() => 
                    new Promise((_, reject) => {
                      console.log("get error")
                      reject({category_map: categoryMap, error_code: ErrorTemplate.error_code.DBGetError})
                    })
                  )
    }else{
      return {}
    }
  },
  imageUploadToStrage: async (userID, itemID, image) => {
    if(userID && itemID){
      let storageRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`)
      return await setAccessTimeout(storageRef.put(image), TIMEOUT_MS)
                    .then(snapshot => {return snapshot.ref.getDownloadURL()})
                    .catch(() => 
                      new Promise((_, reject) => {
                        console.log("image upload error")
                        reject({error_code: ErrorTemplate.error_code.ImageUploadError})
                    }))
    }else {
      return ""
    }
  },
  imageUrlRegister: async (userID, itemID, imageUrl) => {
    if(userID && itemID && imageUrl !== ""){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      return await setAccessTimeout(itemRef.set({image_url: imageUrl}, { merge: true }), TIMEOUT_MS)
                  .then(() => imageUrl)
                  .catch(() => 
                    new Promise((_, reject) => {
                      console.log("image upload error")
                      reject({error_code: ErrorTemplate.error_code.ImageUploadError})
                    })
                  )
    }
  },
  addItemContent: async (userID, itemContent) => {
    if(userID && itemContent !== {}){
      let addDoc = db.collection('users').doc(userID)
                     .collection('stock_items')
      return await setAccessTimeout(addDoc.add(DBTemplate.add_content(itemContent)), TIMEOUT_MS)
                  .then(ref =>  ref.id)
                  .catch(() => 
                  new Promise((_, reject) => {
                    console.log("add item error")
                    reject({error_code: ErrorTemplate.error_code.DBSaveError})
                  })
                  )
    }else{
      return ""
    }
  },
  updateItemContent: async (userID, itemID, itemContent) => {
    if(userID && itemID && itemContent !== {}){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      return await setAccessTimeout(itemRef.update(DBTemplate.update_content(itemContent)), TIMEOUT_MS)
                   .catch(() => 
                    new Promise((_, reject) => {
                      console.log("update item error")
                      reject({error_code: ErrorTemplate.error_code.DBSaveError})
                    })
                   )
    }
  },
  deleteItemContent: async (userID, itemID, itemContent) => {
    if(userID && itemID){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      await AccessFireBase._deleteImageFromStrage(userID, itemID, itemContent)
      return await setAccessTimeout(itemRef.delete(), TIMEOUT_MS)
                    .catch(() =>
                      new Promise((_, reject) => {
                        console.log("delete error")
                        reject({error_code: ErrorTemplate.error_code.DBDeleteError})        
                      })
                    )
    }
  },
  _deleteImageFromStrage: async (userID, itemID, itemContent) => {
    if(userID && itemID){
      if(itemContent.image_url){
        let deleteRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`)
        await setAccessTimeout(deleteRef.delete(), TIMEOUT_MS).catch()
      }
    }
  },
  getItemIDListOfCategory: async (userID, categoryID) => {
    if(userID && categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      return await setAccessTimeout(categoryRef.get(), TIMEOUT_MS)
                  .then(doc => {
                    let categoryDocData = doc.data()
                    return categoryDocData.item_id || []
                  })
                  .catch(() => 
                    new Promise((_, reject) => {
                      console.log("get category list error")
                      reject({error_code: ErrorTemplate.error_code.DBGetError})
                    })
                  )
    }else {
      return []
    }
  },
  updateItemIDListOfCategory: async (userID, categoryID, itemIDList) => {
    if(userID && categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      return await setAccessTimeout(categoryRef.update(DBTemplate.category_update_content(itemIDList)), TIMEOUT_MS)
            .catch(() => 
              new Promise((_, reject) => {
                console.log("update itemID list error")
                reject({error_code: ErrorTemplate.error_code.DBSaveError})
              })
            )
    }
  },
  createCategoryContent: async (userID, categoryName, categoryMap) => {
    if(userID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let categoryRef = userRef.collection('categories')
  
      // categoryIDの新規発行
      let categoryID = await categoryRef.add(DBTemplate.category_create_content(categoryName))
                                        .then(ref => ref.id)
  
      // category mapの更新
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })
  
      return [categoryID, newCategoryMap]  
    }else {
      return ["", categoryMap]
    }
  },
  deleteCategoryContent: async (userID, categoryID, categoryMap) => {
    if(userID && categoryID){
      // item側からcategory_idを削除
      // category_idが削除したいものと一致しているitemを取得し、該当する各itemからcategory_idを削除
      let ItemContainsCategoryShots = await db.collection('users').doc(userID)
                                              .collection('stock_items')
                                              .where('category_id', '==', categoryID)
                                              .get()
      if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty){
        ItemContainsCategoryShots.forEach(doc => {
          doc.ref.update({category_id: ""})
        })
      }
      // categoryIDの削除
      await db.collection('users').doc(userID)
              .collection('categories').doc(categoryID).delete()
      
      // category mapの更新
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      delete newCategoryMap[categoryID]
      await db.collection('users').doc(userID).update({category_map: newCategoryMap})

      return newCategoryMap
    }else{
      return categoryMap
    }
  },
  updateCategoryName: async (userID, categoryID, categoryName, categoryMap) => {
    if(userID && categoryID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let categoryRef = userRef.collection('categories').doc(categoryID)

      await categoryRef.update(DBTemplate.category_update_name(categoryName))

      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })

      return newCategoryMap
    }else{
      return categoryMap
    }
  },
  updateCategoryMap: async (userID, categoryID, categoryName, categoryMap) => {
    if(categoryID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })
      return newCategoryMap  
    }else {
      return categoryMap
    }
  }
}


export default AccessFireBase