function isValidDateFormat(dateString) {
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  return dateFormatRegex.test(dateString);
}

module.exports = isValidDateFormat;