import { useState } from "react";
import { isFirefox, isMobile } from "react-device-detect";
import { shareIcon } from "~/images/icons";
import { statFormat } from "~/util/text";

type Props = {
  score: number;
  surveyId: number;
  guesses: number;
  guessesToWin?: number;
};

export default function ShareButton({
  score,
  surveyId,
  guesses,
  guessesToWin,
}: Props) {
  // Sharing your score
  const [msg, setMsg] = useState("Share");
  const [copied, setCopied] = useState(false);
  async function shareScore() {
    let shareString = `Survey #${surveyId}
Score: ${statFormat(score * 100)}%
Guesses: ${guesses}

#Plurality`;
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
        <img src={shareIcon} width={16} height={16} alt="Share icon" />
      </button>
      <p>{msg}</p>
    </div>
  );
}
