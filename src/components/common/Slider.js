const Slider = ({ min, max, step, value, onMouseUp, disabled, label, setVal }) => {
  const trackDrag = (event) => {
    const newVal = event.target.value;
    setVal(newVal);
  }

  return (
    <div className="mt-4 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onMouseUp={onMouseUp}
        onChange={trackDrag}
        className="range range-primary accent-green-400 w-full"
        id="custom-slider"
      />
      <label htmlFor="custom-slider" className={`block mt-2 font-mono ${disabled ? "text-gray-500" : "text-black"}`}>
        {label}: {value}
      </label>
    </div>
  );
};

export default Slider;
