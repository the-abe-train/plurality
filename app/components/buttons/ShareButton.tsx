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
      .join();
    let shareString = `#Plurality Survey ${surveyId}
Score: ${percentFormat(score)}
Guesses to win: ${guessesToWin}
Guesses total: ${guesses}
${purples}${oranges}

https://plurality.fun`;
    setCopied(true);
    try {
      if ("canShare" in navigator && isMobile && !isFirefox) {
        console.log("Option 1");
        setMsg("Shared!");
        return await navigator.share({
          title: "Plurality Stats",
          text: shareString,
        });
      } else if (navigator.clipboard && window.isSecureContext) {
        console.log("Option 2");
        setMsg("Copied!");
        return await navigator.clipboard.writeText(shareString);
      } else {
        console.log("Option 3");
        document.execCommand("copy", true, shareString);
        setMsg("Copied!");
        return;
      }
    } catch (e) {
      console.log("Option 4");
      setMsg("This browser cannot share.");
      return;
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
