import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { percentFormat, statFormat } from "~/util/text";

type Props = {
  value: number;
  percent?: boolean;
};

export default function Counter({ value, percent }: Props) {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(value);

  useEffect(() => {
    setFrom(to);
    setTo(value);
  }, [value]);

  const nodeRef = useRef<HTMLParagraphElement>(null!);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(from, to, {
      duration: 1,
      onUpdate(value) {
        node.textContent = `${
          percent ? percentFormat(value) : statFormat(value)
        }`;
      },
    });

    return () => controls.stop();
  }, [from, to]);

  return <p className="font-semibold font-header text-3xl" ref={nodeRef} />;
}
