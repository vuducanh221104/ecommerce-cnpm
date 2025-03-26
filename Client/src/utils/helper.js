export function currencyFormat(num) {
  // Handle undefined, null, NaN or non-numeric values
  if (
    num === undefined ||
    num === null ||
    isNaN(num) ||
    typeof num !== "number"
  ) {
    return "$0";
  }

  return (
    "$" +
    Math.round(num)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  );
}

/**
 * Format a date string or Date object to a user-friendly format
 * @param {string|Date} dateInput - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "N/A";

  try {
    // Convert string timestamps to numbers if they're numeric strings
    if (typeof dateInput === "string" && !isNaN(Number(dateInput))) {
      dateInput = Number(dateInput);
    }

    const date = new Date(dateInput);

    // If date is invalid, try alternative parsing
    if (isNaN(date.getTime())) {
      // Try ISO string format
      const isoDate = new Date(dateInput.replace(/-/g, "/"));
      if (!isNaN(isoDate.getTime())) {
        return formatDateObject(isoDate, options);
      }

      console.error("Invalid date format:", dateInput);
      return "N/A";
    }

    return formatDateObject(date, options);
  } catch (error) {
    console.error("Error formatting date:", error, "Input was:", dateInput);
    return "N/A";
  }
}

/**
 * Helper function to format a valid Date object
 */
function formatDateObject(date, options = {}) {
  // Default options for date formatting
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
}
