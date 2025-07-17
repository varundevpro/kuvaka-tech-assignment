import { isToday, format, isYesterday, isThisYear } from "date-fns";

export function formatMessageTimestamp(date) {
  if (isToday(date)) {
    return format(date, "'Today at' h:mm a"); // Today at 2:15 PM
  } else if (isYesterday(date)) {
    return format(date, "'Yesterday at' h:mm a"); // Yesterday at 10:01 AM
  } else if (isThisYear(date)) {
    return format(date, "MMM d 'at' h:mm a"); // Mar 5 at 7:30 PM
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a"); // Mar 5, 2023 at 7:30 PM
  }
}
