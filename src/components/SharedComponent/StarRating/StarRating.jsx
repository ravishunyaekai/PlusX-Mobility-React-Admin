import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import styles from "./StarRating.module.css";
 
export const StarRating = ({ rating, className }) => {
    const totalStars  = 5;
    const fullStars   = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    return (
        <div className={`${styles.starRating} ${className || ""}`}>
            {Array.from({ length: totalStars }).map((_, i) => {
                if (i < fullStars) {
                    return <FaStar key={i} />;
                } else if (i === fullStars && hasHalfStar) {
                    return <FaStarHalfAlt key={i} />;
                } else {
                    return <FaRegStar key={i} />;
                }
            })}
        </div>
    );
};
