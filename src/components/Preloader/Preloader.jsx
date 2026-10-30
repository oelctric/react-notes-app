import "./Preloader.css";

function Preloader() {
  return (
    <div className="preloader">
      <div className="circle-preloader"></div>
      <p className="preloader__text">Searching for notes...</p>
    </div>
  );
}

export default Preloader;
