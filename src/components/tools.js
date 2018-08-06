
export function getSubstiteByIndex(index) {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUWXYZ'.split('')
  const times = (index > 0) ? Math.ceil(index / alphabets.length) : 1
  const alphaIndex = index % alphabets.length
  const character = alphabets[alphaIndex]
  return Array(times + 1).join(character)
}

function validateFile(supportedFileTypes, file) {
  var filesOk = false;
  for (var i = 0; i < supportedFileTypes.length; i++) {
    if(file.name.indexOf(supportedFileTypes[i]) !== -1) {
      filesOk = true;
    }
  }
  return filesOk
}

export function validateFileInput(files) {
  return new Promise((resolve, reject) => {
      var filesOk = false;
      const supportedFileTypes = ['.pdf','.docx', '.txt']
      if (!files) {
        reject('Anna tiedosto.')
        return;
      }
      for (var i = 0; i < files.length; i++) {
        filesOk = validateFile(supportedFileTypes, files[i])
        if (!filesOk) {
          break;
        }
      }

      if (!filesOk) {
        reject('Tiedosto ei kelpaa, anna yksi seuraavista ' + supportedFileTypes)
      } else {
        resolve(true)
      }
    })
}
