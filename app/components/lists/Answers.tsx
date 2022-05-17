import { rankToLetter, statFormat } from "~/util/text";
import { motion } from "framer-motion";
import { useRef } from "react";
import { VoteAggregation } from "~/db/schemas";

type Props = {
  guesses: VoteAggregation[];
  totalVotes: number;
  score: number;
  displayPercent: boolean;
  category: "word" | "number";
};

export default function Answers({
  guesses,
  totalVotes,
  score,
  displayPercent,
  category,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const sortedGuesses = guesses.sort((a, z) => z.votes - a.votes);
  const guessedVotes = guesses.reduce((total, guess) => {
    return total + guess.votes;
  }, 0);
  const showRemainingStat = displayPercent
    ? statFormat((1 - score) * 100) + "%"
    : totalVotes - guessedVotes;

  return (
    <section>
      <motion.div
        variants={{
          hidden: {
            height: 0,
            transition: {
              staggerChildren: 0.5,
            },
          },
          visible: {
            height: "auto",
            transition: {
              staggerChildren: 0.5,
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
          const score = statFormat((answer.votes / totalVotes) * 100);
          const showStat = displayPercent ? score + "%" : answer.votes;
          const rank =
            category === "word" ? answer.ranking : rankToLetter(answer.ranking);
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
              >
                {rank + ". " + answer._id}
              </span>
              <span className="mx-2 text-sm">{showStat}</span>
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
}
