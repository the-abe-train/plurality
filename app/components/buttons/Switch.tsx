type Props = {
  mode: boolean;
  setMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Switch({ mode, setMode }: Props) {
  return (
    <form action="" className="flex justify-between items-center space-x-4">
      <div className="switcher" onClick={() => setMode(!mode)}>
        <label className="hidden" htmlFor="toggle">
          Switch
        </label>
        <input
          name="toggle"
          type="checkbox"
          checked={mode}
          className="w-full h-full"
          onChange={() => console.log("Switch toggled")}
        />
        <span className="slider" data-cy="percent-toggle"></span>
      </div>
    </form>
  );
}
