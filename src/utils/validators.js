const isValidIranPhone = (phone) => /^09\d{9}$/.test(phone);

module.exports = {
  isValidIranPhone,
};
