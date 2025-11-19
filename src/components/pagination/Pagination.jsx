import React, { useEffect, useState } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import "./style.scss";

const Pagination = ({ totalItems, itemsPerPage, onPageChange, page }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleClick = (p) => {
    setCurrentPage(p);
    onPageChange(p);
  };

  useEffect(() => {
    setCurrentPage(page);
  }, []);

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // Determine range of page numbers to display
    const maxPagesToShow = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPagesToShow) {
      const middlePage = Math.ceil(maxPagesToShow / 2);
      startPage = Math.max(currentPage - middlePage + 1, 1);
      endPage = Math.min(currentPage + middlePage - 1, totalPages);

      if (endPage - startPage < maxPagesToShow - 1) {
        if (currentPage < Math.ceil(maxPagesToShow / 2)) {
          endPage = maxPagesToShow;
        } else {
          startPage = endPage - maxPagesToShow + 1;
        }
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={currentPage === i ? "active" : null}>
          <button onClick={() => handleClick(i)}>{i}</button>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="paginationContainer">
      <ul className="pagination">
        <li>
          <button
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdArrowBackIosNew />
          </button>
        </li>
        {renderPageNumbers()}
        <li>
          <button
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdArrowForwardIos />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
