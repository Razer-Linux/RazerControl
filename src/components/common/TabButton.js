const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium leading-5 text-center transition-colors duration-150
      border-b-2 ${
        active
          ? "border-green-500 text-green-600"
          : "border-transparent hover:text-green-600 hover:border-green-400"
      }`}
  >
    {children}
  </button>
);

export default TabButton;
