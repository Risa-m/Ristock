

const ErrorTemplate = {
  error_code: {
    ImageUploadError: "ImageUploadError",
    DBGetError: "DBGetError",
    DBSaveError: "DBSaveError",
    DBDeleteError: "DBDeleteError",
    ImageDeleteError: "ImageDeleteError",
    MaxStockItemsError: "MaxStockItemsError",
  },
  error_msg: {
    ImageUploadError: "画像の保存に失敗しました。時間を置いてから再読み込みしてください。",
    DBGetError: "データの取得に失敗しました。時間を置いてから再読み込みしてください。",
    DBSaveError: "保存に失敗しました。時間を置いてから再読み込みしてください。",
    DBDeleteError: "削除に失敗しました。",
    ImageDeleteError: "画像の削除に失敗しました。",
    MaxStockItemsError: "保存数が最大に達しています。",
  }
}

export default ErrorTemplate