import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useState } from "react";
import { VoteAggregation } from "~/db/schemas";
import { MAX_GUESSES, THRESHOLD } from "~/util/constants";
import Counter from "~/components/text/Counter";
import ShareButton from "~/components/buttons/ShareButton";
import { percentFormat } from "~/util/text";

type Props = {
  points: number;
  score: number;
  guesses: VoteAggregation[];
  win: boolean;
  instructions: boolean;
  surveyId: number;
  guessesToWin?: number;
};

export default function Scorebar({
  points,
  score,
  guesses,
  win,
  instructions,
  surveyId,
  guessesToWin,
}: Props) {
  const items = [
    {
      name: "Guesses left",
      text: <p className="text-center">Guesses</p>,
      value: MAX_GUESSES - guesses.length,
      percentage: false,
    },
    {
      name: "Points",
      text: <p>Points</p>,
      value: points,
      percentage: false,
    },
    {
      name: "Score",
      text: <p>Score</p>,
      value: score,
      percentage: true,
    },
  ];

  const [currentItem, setCurrentItem] = useState("Guesses left");
  const [showPopup, setShowPopup] = useState(instructions);
  const control = useAnimation();

  const shareButtonProps = {
    score,
    surveyId,
    guesses: guesses.length,
    guessesToWin,
  };

  const containerVariants = {
    collapsed: {
      height: "0px",
      opacity: 0,
      transition: {
        duration: 0.25,
        when: "afterChildren",
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
      },
    },
  };

  const childVariants = {
    collapsed: {
      height: "auto",
      opacity: 0,
      transition: {
        duration: 0.25,
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.25,
      },
    },
  };

  function togglePopup(name: string) {
    if (name === currentItem) {
      setShowPopup(false);
      setCurrentItem("");
      return;
    }
    setCurrentItem(name);
    setShowPopup(true);
    control.start({
      opacity: [1, 0, 1],
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-3/4 mx-auto bg-gray-100 border border-outline rounded-full h-2.5 relative">
        <motion.div
          className="h-full rounded-full z-20"
          style={{ backgroundColor: win ? "#04BA10" : "#c43661" }}
          initial={{ width: 0 }}
          animate={{ width: percentFormat(score) }}
          transition={{ duration: 1 }}
        ></motion.div>
        <div
          className="h-full w-1 z-10 bg-outline absolute top-0"
          style={{ left: `calc(${THRESHOLD}% - 2px)` }}
        ></div>
      </div>
      <div className="flex items-end w-full justify-around">
        {items.map((item) => {
          return (
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => togglePopup(item.name)}
              key={item.name}
            >
              <Counter value={item.value} percent={item.percentage} />
              {item.text}
            </div>
          );
        })}
        {win && <ShareButton {...shareButtonProps} />}
      </div>
      <AnimatePresence initial={false}>
        {showPopup && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={containerVariants}
            className="card md:border-0"
          >
            <motion.div
              variants={childVariants}
              className="flex rounded-md bg-primary2 p-3"
            >
              {currentItem === "Guesses left" && (
                <p className="m-0 h-max">
                  You have <b>{MAX_GUESSES - guesses.length} guesses</b> left to
                  reach a <b>{THRESHOLD}% score</b>.
                </p>
              )}
              {currentItem === "Points" && (
                <p className="m-0 h-max">
                  <b>Points</b> are the number votes received by all correctly
                  guessed survey responses.
                </p>
              )}
              {currentItem === "Score" && (
                <p className="m-0 h-max">
                  <b>Score</b> is the percentage of points acquired out of the
                  total points available.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
