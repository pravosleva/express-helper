// import { IValues } from './interfaces';
// import { isValidPhoneNumber } from 'react-phone-number-input';
import { TValues } from './interfaces'

export const getErrors = (values: TValues): Partial<TValues> => {
  const errors: Partial<TValues> = {};
  // if (!values.email) {
  //   errors.email = 'Обязательное поле';
  // }
  // else if (
  //   !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
  // ) {
  //   errors.email = 'Некорректный email';
  // }
  if (!values.password) {
    errors.password = 'Обязательное поле';
  }
  // if (!values.phone) {
  //   errors.phone = 'Обязательное поле';
  // } else if (!isValidPhoneNumber(values.phone)) {
  //   errors.phone = 'Некорректный номер';
  // }

  return errors;
};
