import { useEffect } from "react";

type ValidationProps = {
  voteText: string;
  category: "number" | "word";
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setMsg: React.Dispatch<React.SetStateAction<string>>;
  setMsgColour: React.Dispatch<React.SetStateAction<string>>;
};

export default function useValidation({
  voteText,
  category,
  setEnabled,
  setMsg,
  setMsgColour,
}: ValidationProps) {
  const containsLetter = !!voteText.match(/[a-zA-Z]/);
  const containsNumber = !!voteText.match(/\d/);
  const containsSymbol = !!voteText.match(
    /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\]/
  );

  return useEffect(() => {
    if (voteText.length < 1 || voteText.length > 20) {
      setEnabled(false);
    } else if (
      voteText !== voteText.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    ) {
      setEnabled(false);
      setMsg("Response cannot contain accented characters.");
      setMsgColour("red");
    } else if (voteText.trim().includes(" ")) {
      setEnabled(false);
      setMsg("Response cannot contain a space.");
      setMsgColour("red");
    } else if (containsSymbol) {
      setEnabled(false);
      setMsg("Response cannot contain a symbol.");
      setMsgColour("red");
    } else if (category === "number" && containsLetter) {
      setEnabled(false);
      setMsg("Response cannot contain letters.");
      setMsgColour("red");
    } else if (category === "word" && containsNumber) {
      setEnabled(false);
      setMsg("Response cannot contain numbers.");
      setMsgColour("red");
    } else {
      setEnabled(true);
      setMsg("");
      setMsgColour("inherit");
    }
  }, [voteText]);
}
