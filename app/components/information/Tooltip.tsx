import helpIcon from "~/images/icons/help.svg";
export default function Tooltip({ text }: { text: string }) {
  return (
    <div className="relative flex flex-col items-center group h-fit">
      <img src={helpIcon} alt="Help Icon" className="w-5 h-5" />
      <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
        <span
          className="relative z-10 p-2 text-xs leading-none 
      text-white whitespace-no-wrap bg-black shadow-lg w-36"
        >
          {text}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    </div>
  );
}
