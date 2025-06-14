/**
 * Date Utility Functions
 */

/**
 * Parse a date string in format "DD/MM/YY" and time string in format "HH:MM"
 * @param dateStr Date string in format "DD/MM/YY"
 * @param timeStr Time string in format "HH:MM"
 * @returns JavaScript Date object
 */
export function parseRideDateTime(dateStr: string, timeStr: string): Date {
  // Parse date parts
  const [day, month, year] = dateStr.split('/').map(Number);
  
  // Parse time parts
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date with full year (assuming yy format)
  const fullYear = year < 100 ? 2000 + year : year;
  
  // Return date object (month is 0-based in JavaScript)
  return new Date(fullYear, month - 1, day, hours, minutes);
}

/**
 * Check if a ride date is in the past (expired)
 * @param dateStr Date string in format "DD/MM/YY"
 * @param timeStr Time string in format "HH:MM"
 * @returns Boolean indicating if the ride has expired
 */
export function isRideExpired(dateStr: string, timeStr: string): boolean {
  const rideDate = parseRideDateTime(dateStr, timeStr);
  const currentDate = new Date();
  
  return rideDate < currentDate;
}

/**
 * Format dates for display
 * @param dateStr Date string in format "DD/MM/YY"
 * @returns Formatted date string for display
 */
export function formatRideDate(dateStr: string): string {
  // This can be expanded to format dates nicely based on locale/preferences
  return dateStr;
} 