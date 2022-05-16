import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import {
  draftIcon,
  guessIcon,
  infoIcon,
  logo,
  respondIcon,
  userIcon,
} from "~/images/icons";

type Props = {
  name?: string;
};

export default ({ name }: Props) => {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null!);
  function useOutsideAlerter(ref: React.MutableRefObject<HTMLDivElement>) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideAlerter(wrapperRef);

  // Scroll locking
  useEffect(() => {
    if (open) {
      disableBodyScroll(wrapperRef.current);
    } else {
      enableBodyScroll(wrapperRef.current);
    }
  }, [wrapperRef, open]);

  return (
    <nav className="flex drop-shadow-block z-10" ref={wrapperRef}>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{
              width: "75vw",
            }}
            exit={{
              width: 0,
              transition: { duration: 0.3 },
            }}
            className="bg-primary1 fixed -right-4 -top-4 py-14 bottom-0 h-[105vh] overflow-hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setOpen(false)}
              className="space-y-12 flex flex-col"
            >
              <Link to="/user" className="text-2xl mx-5 flex items-center">
                <img
                  src={userIcon}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>{name || "Connect"}</span>
              </Link>
              <Link to="/surveys" className="text-2xl mx-5 flex items-center">
                <img
                  src={logo}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>Surveys</span>
              </Link>
              <div className="flex flex-col space-y-8">
                <Link
                  to="/surveys/today"
                  className="text-xl mx-8 flex items-center"
                >
                  <img
                    src={guessIcon}
                    alt="Instruction symbol"
                    className="mr-2 inline"
                    width={18}
                  />
                  <span>Guess</span>
                </Link>
                <Link
                  to="/surveys/tomorrow"
                  className="text-xl mx-8 flex items-center"
                >
                  <img
                    src={respondIcon}
                    alt="Instruction symbol"
                    className="mr-2 inline"
                    width={18}
                  />
                  Respond
                </Link>
                <Link to="/draft" className="text-xl mx-8 flex items-center">
                  <img
                    src={draftIcon}
                    alt="Instruction symbol"
                    className="mr-2 inline"
                    width={18}
                  />
                  Draft
                </Link>
              </div>
              <Link
                to="/help/what-is-plurality"
                className="text-2xl mx-5 flex items-center"
              >
                <img
                  src={infoIcon}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>Help</span>
              </Link>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        // @ts-ignore
        onClick={() => setOpen(!open)}
        className="w-10 h-9 relative"
      >
        {open ? (
          <>
            <span className="left-1/4 top-2 block absolute h-[2px] w-0 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform rotate-45"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform -rotate-45"></span>
            <span className="left-1/4 top-6 block absolute h-[2px] w-0 bg-black rounded transition-transform"></span>
          </>
        ) : (
          <>
            <span className="left-1/4 top-2 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-6 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
          </>
        )}
      </button>
    </nav>
  );
};
