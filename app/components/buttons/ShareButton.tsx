import { useState } from "react";
import { isFirefox, isMobile } from "react-device-detect";
import { shareIcon } from "~/images/icons";
import { percentFormat } from "~/util/text";

type Props = {
  score: number;
  surveyId: number;
  guesses: number;
  guessesToWin: number;
  win: boolean;
};

export default function ShareButton({
  score,
  surveyId,
  guesses,
  guessesToWin,
  win,
}: Props) {
  // Sharing your score
  const [msg, setMsg] = useState("Share");
  const [copied, setCopied] = useState(false);

  async function shareScore() {
    const winnerSquares = win && guesses >= guessesToWin ? guessesToWin : 0;
    const purples = [...new Array(winnerSquares)].map(() => "🟪").join("");
    const oranges = [...new Array(guesses - winnerSquares)]
      .map(() => "🟧")
      .join("");
    let shareString = `#Plurality Survey ${surveyId}
Score: ${percentFormat(score)}
Guesses to win: ${win ? guessesToWin : "N/A"}
Guesses total: ${guesses}
${purples}${oranges}

https://plurality.fun/surveys/${surveyId}/sample`;

    if (guessesToWin >= 999) {
      return setMsg("Error sharing score.");
    }

    setCopied(true);
    try {
      if ("canShare" in navigator && isMobile && !isFirefox) {
        await navigator.share({ title: "Plurality Stats", text: shareString });
        return setMsg("Shared!");
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareString);
        return setMsg("Copied!");
      } else {
        document.execCommand("copy", true, shareString);
        return setMsg("Copied!");
      }
    } catch (e) {
      return setMsg("This browser cannot share");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        className="silver px-3 py-2"
        onClick={shareScore}
        disabled={copied}
        data-cy="share-btn"
      >
        <img src={shareIcon} width={16} height={16} alt="Share icon" />
      </button>
      <p className="text-center">{msg}</p>
    </div>
  );
}
