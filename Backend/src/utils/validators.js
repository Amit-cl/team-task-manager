export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
export const isFutureOrToday = (dateValue) => {
  const inputDate = new Date(dateValue);
  if (Number.isNaN(inputDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today;
};
export const isValidObjectId = (mongoose, id) => mongoose.Types.ObjectId.isValid(id);
