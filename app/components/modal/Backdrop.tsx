import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  onClick: any;
};

export default ({ children, onClick }: Props) => {
  return (
    <motion.div
      className="absolute top-0 left-0 bottom-0 w-screen md:w-full bg-[#000000d1] 
    flex items-center justify-center z-30"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-cy="backdrop"
    >
      {children}
    </motion.div>
  );
};
