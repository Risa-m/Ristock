

const ErrorTemplate = {
  error_code: {
    ImageUploadError: "ImageUploadError",
    DBGetError: "DBGetError",
    DBSaveError: "DBSaveError",
    DBDeleteError: "DBDeleteError",
    ImageDeleteError: "ImageDeleteError",
  },
  error_msg: {
    ImageUploadError: "画像の保存に失敗しました。",
    DBGetError: "データの取得に失敗しました。",
    DBSaveError: "保存に失敗しました。",
    DBDeleteError: "削除に失敗しました。",
    ImageDeleteError: "画像の削除に失敗しました。",
  }

}

export default ErrorTemplate