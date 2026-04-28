import ReactPaginate from 'react-paginate';
import styles from './pagination.module.css'
import { ReactComponent as PreviousIcon } from '../../../assets/images/right.svg';
import { ReactComponent as NextIcon } from '../../../assets/images/left.svg'; 

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; 
    onPageChange(selectedPage);
  };

  return (
    <>
      <ReactPaginate
        previousLabel={<PreviousIcon className={styles.icon} />}
        nextLabel={<NextIcon className={styles.icon} />}
        breakLabel={"..."}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={styles.pagination}
        activeClassName={styles.activePage}
        forcePage={currentPage - 1}
      />
    </>
  );
};

export default Pagination