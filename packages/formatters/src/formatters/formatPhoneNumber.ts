export const formatPhoneNumber = (rawPhone?: string) => {
  if (!rawPhone) return;

  if (/^\+7\d{10}$/.test(rawPhone)) {
    return [
      '+7',
      `${rawPhone.slice(2, 5)}`,
      `${rawPhone.slice(5, 8)}-${rawPhone.slice(8, 10)}-${rawPhone.slice(10)}`,
    ].join(' ');
  }

  return rawPhone;
};
