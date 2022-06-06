import { SurveySchema } from "~/db/schemas";
import Scorebar from "~/components/game/Scorebar";
import Survey from "~/components/game/Survey";
import { motion } from "framer-motion";
import xIcon from "~/images/icons/X.svg";
import Backdrop from "./Backdrop";
import { ScorebarProps } from "../schemas";

type Props = {
  scorebarProps: ScorebarProps;
  survey: SurveySchema;
  handleClose: () => void;
};

const dropIn = {
  hidden: { y: "-100vh", x: "-50%", opacity: 0 },
  visible: {
    y: "-50%",
    x: "-50%",
    opacity: 1,
    transition: { duration: 0.1, type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { y: "100vh", x: "-50%", opacity: 0 },
};


export default ({ scorebarProps, survey, handleClose }: Props) => {
  const survey = surveyProps || {
    _id: 1,
    text: "What is the most expensive single item in your home?",
    surveyClose: new Date("2022-05-25T03:59:59.999+00:00"),
    photo: "v-unZQ5EeU8",
    community: false,
    drafted: new Date(),
    category: "word",
  };
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        className="absolute md:top-1/2 top-80 left-1/2 
      bg-primary1 p-5 rounded-md border border-outline z-30 w-max max-w-[90%]"
        onClick={(e) => e.stopPropagation()}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button className="absolute top-3 right-4" onClick={handleClose}>
          <img src={xIcon} alt="X" height={20} width={20} />
        </button>
        <h2 className="font-header mb-2 text-2xl sm:text-left">
          Share your score!
        </h2>
        <Scorebar {...scorebarProps} instructions={false} />
        <h2 className="font-header mb-2 text-2xl sm:text-left mt-8">
          Respond to an open Survey!
        </h2>
        <Survey survey={survey} />
      </motion.div>
    </Backdrop>
  );
};
