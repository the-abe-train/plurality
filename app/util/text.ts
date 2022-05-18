import { NAME_LENGTH } from "./constants";

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

export function trim(str: string) {
  return str.trim().toLowerCase();
}

export function parseAnswer(ans: string) {
  const trimmedAns = trim(ans);
  const splitAns = trimmedAns.split(/[\s,/]/);
  const options = splitAns.filter((a) => {
    const prepositions = ["a", "the", "in"];
    return !prepositions.includes(a);
  });
  return options;
}

export const truncateEthAddress = (address: string) => {
  // Borrowed from truncate-eth-address
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

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
