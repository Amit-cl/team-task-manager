export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const isFutureOrToday = (dateValue) => {
  const inputDate = new Date(dateValue);
  if (Number.isNaN(inputDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

/**
 * Fix: mongoose.Types.ObjectId.isValid() returns true for any 12-byte string.
 * We enforce the proper 24-character hexadecimal ObjectId format.
 */
export const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
