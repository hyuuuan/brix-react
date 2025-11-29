// Utility functions for handling dates in Manila timezone (Asia/Manila)

/**
 * Get current date/time in Manila timezone
 * @returns {Date} Date object representing current Manila time
 */
export const getManilaTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
};

/**
 * Format date to ISO string in Manila timezone (YYYY-MM-DD)
 * @param {Date} date - Date object to format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const toManilaISODate = (date = getManilaTime()) => {
  const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = manilaDate.getFullYear();
  const month = String(manilaDate.getMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to ISO datetime string in Manila timezone (YYYY-MM-DD HH:mm)
 * @param {Date} date - Date object to format
 * @returns {string} ISO datetime string (YYYY-MM-DD HH:mm)
 */
export const toManilaISODateTime = (date = getManilaTime()) => {
  const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = manilaDate.getFullYear();
  const month = String(manilaDate.getMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getDate()).padStart(2, '0');
  const hours = String(manilaDate.getHours()).padStart(2, '0');
  const minutes = String(manilaDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Check if a date is today in Manila timezone
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is today in Manila time
 */
export const isManilaToday = (dateString) => {
  const inputDate = new Date(dateString);
  const inputManilaDate = toManilaISODate(inputDate);
  const todayManilaDate = toManilaISODate();
  return inputManilaDate === todayManilaDate;
};

/**
 * Format date for display in Manila timezone
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatManilaDate = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    ...options
  });
};

/**
 * Get Manila date from days ago
 * @param {number} daysAgo - Number of days to subtract
 * @returns {Date} Date object
 */
export const getManilaDaysAgo = (daysAgo) => {
  const manilaTime = getManilaTime();
  manilaTime.setDate(manilaTime.getDate() - daysAgo);
  return manilaTime;
};
