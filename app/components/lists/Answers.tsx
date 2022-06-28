import { percentFormat, rankToLetter, statFormat } from "~/util/text";
import { motion } from "framer-motion";
import { useRef } from "react";
import { RankedVote } from "~/db/schemas";
import { getTotalVotes } from "~/util/gameplay";

type Props = {
  responses: RankedVote[];
  totalVotes: number;
  displayPercent: boolean;
  category: "word" | "number";
  highlights?: string[];
};

export default ({
  responses,
  totalVotes,
  displayPercent,
  category,
  highlights,
}: Props) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const sortedGuesses = responses.sort((a, z) => a.ranking - z.ranking);
  const guessedVotes = responses.reduce((total, guess) => {
    return total + guess.votes;
  }, 0);
  const score2 = getTotalVotes(responses) / totalVotes;
  const showRemainingStat = displayPercent
    ? percentFormat(1 - score2)
    : totalVotes - guessedVotes;

  return (
    <section
      style={{
        overflowY: responses.length > 20 ? "auto" : "inherit",
        maxHeight: responses.length > 20 ? "22rem" : "inherit",
      }}
    >
      <motion.div
        variants={{
          hidden: {
            height: 0,
            transition: {
              staggerChildren: 0.1,
            },
          },
          visible: {
            height: "auto",
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="grid grid-cols-2 gap-1 text-sm"
        ref={nodeRef}
      >
        {sortedGuesses.map((answer, idx) => {
          const score = percentFormat(answer.votes / totalVotes);
          const showStat = displayPercent ? score : statFormat(answer.votes);
          const rank =
            category === "word" ? answer.ranking : rankToLetter(answer.ranking);
          const highlight = !(highlights || []).includes(answer._id);
          const variants = {
            hidden: {
              y: 90,
              x: idx % 2 ? "-50%" : "50%",
              opacity: 0,
            },
            visible: {
              y: 0,
              x: 0,
              opacity: 1,
              transition: {
                duration: 0.5,
              },
            },
          };
          return (
            <motion.div
              key={answer._id}
              className="flex items-center w-full border border-outline 
            rounded-sm bg-primary2 p-1"
              variants={variants}
            >
              <span
                className="text-sm font-bold flex-grow overflow-hidden 
            overflow-ellipsis"
                style={{
                  color: highlight && highlights ? "#6D2F80" : "#2B1628",
                }}
              >
                {rank + ". " + answer._id}
              </span>
              <span
                className="mx-2 text-sm"
                style={{
                  color: highlight && highlights ? "#6D2F80" : "#2B1628",
                }}
              >
                {showStat}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
      <div
        className="flex items-center w-40 border border-outline 
            rounded-sm bg-primary2 p-1 mx-auto my-4"
      >
        <span className="text-sm flex-grow font-bold">Remaining</span>
        <span className="text-sm">{showRemainingStat}</span>
      </div>
    </section>
  );
};
