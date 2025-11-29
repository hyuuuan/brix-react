// Utility functions for handling dates in Manila timezone (Asia/Manila)

/**
 * Get current date/time in Manila timezone
 * @returns {Date} Date object representing current Manila time
 */
const getManilaTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
};

/**
 * Format date to ISO string in Manila timezone (YYYY-MM-DD)
 * @param {Date} date - Date object to format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
const toManilaISODate = (date = getManilaTime()) => {
  const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = manilaDate.getFullYear();
  const month = String(manilaDate.getMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to ISO datetime string in Manila timezone
 * @param {Date} date - Date object to format
 * @returns {string} ISO datetime string
 */
const toManilaISO = (date = getManilaTime()) => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' })).toISOString();
};

/**
 * Format date to MySQL datetime format in Manila timezone
 * @param {Date} date - Date object to format
 * @returns {string} MySQL datetime string (YYYY-MM-DD HH:mm:ss)
 */
const toManilaMySQLDateTime = (date = getManilaTime()) => {
  const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  return manilaDate.toISOString().slice(0, 19).replace('T', ' ');
};

module.exports = {
  getManilaTime,
  toManilaISODate,
  toManilaISO,
  toManilaMySQLDateTime
};
