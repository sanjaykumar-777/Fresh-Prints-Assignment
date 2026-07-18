/**
 * Converts a price shown on the page into a plain number, so amounts can be
 * added up and compared.
 *
 * Examples:
 *   "₹130.00"   -> 130
 *   "Rs. 1,200" -> 1200
 *   ""          -> 0
 *
 * It picks out the first number it finds instead of just deleting everything
 * that is not a digit. That matters because "Rs." ends with a dot: deleting
 * only the letters would leave that dot behind as a decimal point and turn
 * 1,200 into 0.12.
 */
const toAmount = (text) => {
  const match = String(text).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

module.exports = { toAmount };