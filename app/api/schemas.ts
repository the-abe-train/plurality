export type Photo = {
  id: number;
  width: number;
  height: number;
  urls: { large: string; regular: string; raw: string; small: string };
  color: string | null;
  user: {
    username: string;
    name: string;
    links: {
      html: string;
    };
  };
  errors?: string[];
};

export type NFT = {
  token_id: string;
  image_url: string;
  background_color: string;
  name: string;
  external_link: string;
  asset_contract: string;
  owner: string;
  traits: string;
  last_sale: string;
};
