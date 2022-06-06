import { useState } from "react";
import { isFirefox, isMobile } from "react-device-detect";
import { shareIcon } from "~/images/icons";
import { percentFormat } from "~/util/text";

type Props = {
  score: number;
  surveyId: number;
  guesses: number;
  guessesToWin: number;
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
    const purples = [...new Array(guessesToWin)].map(() => "🟪").join("");
    const oranges = [...new Array(guesses - guessesToWin)]
      .map(() => "🟧")
      .join("");
    const colours = guesses >= guessesToWin ? purples + oranges : "";
    let shareString = `#Plurality Survey ${surveyId}
Score: ${percentFormat(score)}
Guesses to win: ${guessesToWin}
Guesses total: ${guesses}
${colours}

https://plurality.fun/surveys/${surveyId}/sample`;

    if (guessesToWin >= 999) {
      shareString = "Error sharing score.";
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
