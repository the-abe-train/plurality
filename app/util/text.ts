import dayjs from "dayjs";
import { NAME_LENGTH } from "./gameplay";

export function statFormat(number: number) {
  if (number >= 1000) {
    const newNum = (number / 1000).toFixed(1);
    return newNum + "k";
  } else if (100 <= number && number < 1000) {
    return String(Math.floor(number));
  } else if (0 < number && number < 100) {
    return String(Math.floor(number));
  } else {
    return String(number);
  }
}

export function percentFormat(number: number) {
  return `${(number * 100).toFixed(1)}%`;
}

export function trim(str: string | number) {
  return String(str).trim().toLowerCase();
}

export const truncateEthAddress = (address: string) => {
  // Borrowed from truncate-eth-address
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export function capitalizeFirstLetter(word: string) {
  const trimmed = word.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// export function capitalizeFirstLetter(string: string | number) {
//   if (typeof string === "number") return string;
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// }

export function truncateName(name: string | undefined): string {
  if (!name) return "Connect";
  if (name.includes("@")) {
    const idx = name.indexOf("@");
    return truncateName(name.substring(0, idx));
  }
  return name.length > NAME_LENGTH
    ? `${name.substring(0, NAME_LENGTH)}...`
    : name;
}

export function rankToLetter(num: number) {
  const ordA = "A".charCodeAt(0);
  const ordZ = "Z".charCodeAt(0);
  const len = ordZ - ordA + 1;
  let s = "";
  let n = num - 1;
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s;
}

export function parseFutureDate(surveyClose: Date) {
  const MINUTES_PER_DAY = 1440;
  const MINUTES_PER_HOUR = 60;
  const totalMinutes = dayjs(surveyClose).diff(dayjs(), "minutes");
  if (totalMinutes < MINUTES_PER_DAY) {
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const minutes = totalMinutes % MINUTES_PER_HOUR;
    return `${hours}h ${minutes}m`;
  }
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const leftoverMinutes = totalMinutes % MINUTES_PER_DAY;
  const hours = Math.floor(leftoverMinutes / MINUTES_PER_HOUR);
  const minutes = leftoverMinutes % MINUTES_PER_HOUR;
  return `${days}d ${hours}h ${minutes}m`;
}
