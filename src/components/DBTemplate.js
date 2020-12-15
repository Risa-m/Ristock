import firebase from '../firebase'

const DBTemplate = {
  content_none: {
    name: "",
    modelNumber: "",
    size: "",
    color: "",
    stockNumber: 0,
    price: 0,
    lotSize: 0,
    old_category_id: "",
    category_id: "",  // カテゴリーのid TODO: リスト化
    category: "",
    image_url: "",
  },
  get_content: (data, category_map) => {
    return {
      data: data,
      name: data.name,
      modelNumber: data.modelNumber,
      size: data.size,
      color: data.color,
      stockNumber: data.stockNumber,
      price: data.price,
      lotSize: data.lotSize,
      old_category_id: data.category_id || "",
      category_id: data.category_id || "",
      category: category_map[data.category_id] || "",
      image_url: data.image_url || "",
    }
  },
  update_content: (content) =>  {
    return {                
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
    }
  },
  add_content: (content) => {
    return {
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
    }
  },
  category_create_content: (newCategoryName) => {
    return {
        name: newCategoryName,
        item_id: [],
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()    
      }
    },
  category_update_content: (itemIDListToRegister) => {
  return {
      item_id: itemIDListToRegister,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()    
    }
  },
  category_update_name: (categoryName) => {
    return {
      name: categoryName,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()    
    }
  }
}

export default DBTemplate