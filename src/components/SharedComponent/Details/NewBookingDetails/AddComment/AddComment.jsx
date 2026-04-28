import { useState } from "react";
import style from "./AddComment.module.css";
 
function AddComment({ comments = [], onAddComment, openModal }) {
  const [input, setInput] = useState("");
 
  const handleSubmit = () => {
    if (!input.trim()) return;
 
    onAddComment(input);
    setInput("");
  };
 
  return (
    <div className={style.container}>
        <div className={style.bookingDetailsSection}>
            <h3 className={style.DetailsMainHeading}>Comments</h3>
            <button className={style.addCommentButton} onClick={openModal}>Add Status</button>
        </div> 
        { comments.length !== 0 &&  (
            <div className={style.timeline}>
                {comments.map((item, index) => (
                    <div key={index} className={style.commentItem}>
                        <div className={style.avatar}> A </div>
                        <div className={style.content}>
                            <div className={style.header}>
                                <span className={style.name}>Admin</span>
                                {/* {item.role && (
                                    <span className={style.role}> · {item.role}</span>
                                )} */}
                                <span className={style.time}>{item.created_at}</span>
                            </div>
                            <div className={style.message}>{item.issue_text}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
 
      <div className={style.inputSection}>
        <textarea className={style.inputField} placeholder="Add a comment..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button className={style.addCommentButton} onClick={handleSubmit}>+ Add Comment</button>
      </div>
    </div>
  );
}
 
export default AddComment;