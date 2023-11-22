const Grid = ({ children }) => {
  return (
    <div className="container mx-auto mt-7">
      <div className="masonry masonry-sm">{children}</div>
    </div>
  );
};

export default Grid;
