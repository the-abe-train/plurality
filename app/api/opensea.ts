import { OPENSEA_API_KEY } from "~/util/env";
import { NFT } from "./schemas";

export async function getNfts(wallet: string) {
  const options = {
    method: "GET",
    headers: { Accept: "application/json", "X-API-KEY": OPENSEA_API_KEY },
  };

  const url = new URL("https://api.opensea.io/api/v1/assets");
  url.searchParams.set("order_direction", "desc");
  url.searchParams.set("limit", "20");
  url.searchParams.set("include_orders", "false");
  url.searchParams.set("owner", wallet);

  const response = await fetch(url, options);
  const output = await response.json();
  const nfts = output.assets as NFT[];
  return nfts;
}
