import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Валидация и нормализация
export default function validateAndFormat(number, defaultCountry = undefined) {
  // defaultCountry — например 'RU' для локального ввода без кода страны
  if(number[0]===8 || 7){
     number = '+7' + number.slice(1);
  }
  const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
  if (!phoneNumber) return { valid: false };

  return {
    valid: phoneNumber.isValid(),
    e164: phoneNumber.isValid() ? phoneNumber.format('E.164') : null,
    intl: phoneNumber.formatInternational(),
    national: phoneNumber.formatNational(),
    country: phoneNumber.country // 'RU', 'US' и т.д.
  };
}

console.log(validateAndFormat('+7 912 345-67-89'));