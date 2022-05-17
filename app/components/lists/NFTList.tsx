import { NFT } from "~/api/schemas";
import { openSeaLogo } from "~/images/icons";

type Props = {
  nfts: NFT[];
  token?: string;
  setToken?: React.Dispatch<React.SetStateAction<string>>;
};

export default ({ nfts, token, setToken }: Props) => {
  return (
    <div className="my-4">
      {/* <form className="my-2">
        <label htmlFor="id" className="space-x-4">
          <span className="mt-4">Survey Number</span>
          <select name="id" className="min-w-[80px]">
            {nfts.map((nft, idx) => (
              <option key={idx} value={idx}>
                {idx}
              </option>
            ))}
          </select>
        </label>
      </form> */}
      {/* <div className="flex flex-wrap items-center justify-items-center max-h-64 overflow-scroll"> */}
      <div className="grid grid-cols-3 max-h-64 overflow-y-scroll">
        {nfts.length > 0 &&
          nfts.map((nft) => {
            const src = nft.image_url || openSeaLogo;
            return (
              <figure
                className="flex flex-col items-center max-w-[100px] m-2"
                key={nft.token_id}
              >
                <img
                  src={src}
                  alt={nft.name}
                  width={100}
                  className="transition-all cursor-pointer"
                  onClick={() => {
                    if (setToken) setToken(nft.token_id);
                  }}
                  style={{
                    filter: token === nft.token_id ? "" : "grayscale(100%)",
                  }}
                />
                <figcaption className="text-center">{nft.name}</figcaption>
              </figure>
            );
          })}
      </div>
      {nfts.length <= 0 && (
        <p>
          You have no Survey Tokens. You can purchase one from{" "}
          <a href="https://opensea.io/PluralityGame" className="underline">
            OpenSea
          </a>
          .
        </p>
      )}
    </div>
  );
};
