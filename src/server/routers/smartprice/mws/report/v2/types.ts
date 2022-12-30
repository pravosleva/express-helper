export enum EInsertDataOption {
  INSERT_ROWS = 'INSERT_ROWS', // Будет дописывать в первый свободный "пробел" в таблице и добавлять пустую строку под ней
  OVERWRITE = 'OVERWRITE', // Будет заполнять свободные строки (если их удалить)
}
