const Dropdown = ({ label, currOption, options, onOptionChange }) => (
  <div className="flex justify-start mb-2">
    <select
      id={label}
      value={currOption}
      onChange={onOptionChange}
      className="p-2 bg-gray-200 "
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default Dropdown;
