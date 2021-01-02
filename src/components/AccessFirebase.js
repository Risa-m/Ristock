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
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      let newCategoryID = ""

      // categoryIDの新規発行
      return await setAccessTimeout(categoryRef.add(DBTemplate.category_create_content(categoryName)), TIMEOUT_MS)
                    .then(ref => ref.id)
                    .then(categoryID => {
                      // category mapの更新
                      newCategoryMap[categoryID] = categoryName
                      newCategoryID = categoryID
                      return setAccessTimeout(userRef.update({ category_map: newCategoryMap }), TIMEOUT_MS)
                    })
                    .then(() => {
                      return [newCategoryID, newCategoryMap] 
                    })
                    .catch(() => 
                      new Promise((_, reject) => {
                        console.log("create category error")
                        reject({error_code: ErrorTemplate.error_code.DBSaveError})
                      })
                    )
    }else {
      return ["", categoryMap]
    }
  },
  deleteCategoryContent: async (userID, categoryID, categoryMap) => {
    if(userID && categoryID){
      // item側からcategory_idを削除
      // category_idが削除したいものと一致しているitemを取得し、該当する各itemからcategory_idを削除

      let userIDRef = db.collection('users').doc(userID)
      let ItemContainsCategoryRef = userIDRef.collection('stock_items')
                                             .where('category_id', '==', categoryID)
      let categroyIDRef = userIDRef.collection('categories').doc(categoryID)

      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      delete newCategoryMap[categoryID]
                      
      return await setAccessTimeout(ItemContainsCategoryRef.get(), TIMEOUT_MS)
                  .then(ItemContainsCategoryShots => {
                    if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty){
                      return ItemContainsCategoryShots.forEach(doc => {
                        doc.ref.update({category_id: ""})
                      })
                    }
                  })
                  .then(() => {
                    // category mapの更新
                    return setAccessTimeout(userIDRef.update({category_map: newCategoryMap}), TIMEOUT_MS)
                  })
                  .then(() => {
                    // categoryIDの削除
                    return categroyIDRef.delete()
                  })
                  .then(() => {
                    return newCategoryMap
                  })
                  .catch(() => 
                    new Promise((_, reject) => {
                      console.log("delete category eror")
                      reject({error_code: ErrorTemplate.error_code.DBDeleteError})
                    })
                  )
    }else{
      return categoryMap
    }
  },
  updateCategoryName: async (userID, categoryID, categoryName, categoryMap) => {
    if(userID && categoryID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let categoryRef = userRef.collection('categories').doc(categoryID)
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy

      return await setAccessTimeout(categoryRef.update(DBTemplate.category_update_name(categoryName)), Test_Timeout_ms)
      .then(() => {
        newCategoryMap[categoryID] = categoryName
        return newCategoryMap
      })
      .then(() => {
        return setAccessTimeout(userRef.update({ category_map: newCategoryMap }), Test_Timeout_ms)
      })
      .then(() => {
        return newCategoryMap
      })
      .catch(() => 
        new Promise((_, reject) => {
          console.log("update category name error")
          reject({error_code: ErrorTemplate.error_code.DBSaveError})
        })
      )

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