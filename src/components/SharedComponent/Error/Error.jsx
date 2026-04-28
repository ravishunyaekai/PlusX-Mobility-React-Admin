import style from "./Error.module.css";

function Error() {
  return (
    <div className={`${style.container}`}>
      <div className={`${style.code}`}>404</div>
      <span className={`${style.seperator}`}>|</span>
      <div className={`${style.message}`}>Not Found</div>
    </div>
  );
}

export default Error;
