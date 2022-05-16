import dayjs from "dayjs";
import { useState } from "react";
import { isFirefox, isMobile } from "react-device-detect";
import { shareIcon } from "~/images/icons";

type Props = {
  score: number;
};

export default function ShareButton({ score }: Props) {
  // Sharing your score
  const [msg, setMsg] = useState("Share");
  const [copied, setCopied] = useState(false);
  async function shareScore() {
    let shareString = `${dayjs()}
Score: ${score}
`;
    setCopied(true);
    setMsg("Shared!");
    if ("canShare" in navigator && isMobile && !isFirefox) {
      return await navigator.share({
        title: "Plurality Stats",
        text: shareString,
      });
    } else {
      setMsg("Copied!");
      if ("clipboard" in navigator) {
        return await navigator.clipboard.writeText(shareString);
      } else {
        return document.execCommand("copy", true, shareString);
      }
    }
  }
  return (
    <div className="flex flex-col items-center">
      <button
        className="silver px-3 py-2"
        onClick={shareScore}
        disabled={copied}
      >
        <img src={shareIcon} width={16} alt="Share icon" />
      </button>
      <p>{msg}</p>
    </div>
  );
}
