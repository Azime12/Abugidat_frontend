import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { FaEllipsisH } from "react-icons/fa";

// Rows per page selector with animations
const RowsPerPageSelector = ({ rowsPerPage, handleChangeRowsPerPage }) => (
  <motion.div
    className="flex items-center space-x-2"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.span className="text-sm text-gray-600" whileHover={{ scale: 1.05 }}>
      Show
    </motion.span>

    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <select
        value={rowsPerPage}
        onChange={handleChangeRowsPerPage}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-8"
      >
        {[5, 10, 25, 50, 100].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ y: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.div>
    </motion.div>

    <motion.span className="text-sm text-gray-600" whileHover={{ scale: 1.05 }}>
      rows
    </motion.span>
  </motion.div>
);

// Pagination button component
const PaginationButton = ({
  children,
  onClick,
  disabled = false,
  active = false,
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`w-10 h-10 flex items-center justify-center rounded-full ${
      active
        ? "bg-blue-500 text-white shadow-md"
        : disabled
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-700 hover:bg-gray-100"
    }`}
    whileHover={
      !disabled
        ? { scale: 1.1, backgroundColor: active ? "#3B82F6" : "#F3F4F6" }
        : {}
    }
    whileTap={!disabled ? { scale: 0.95 } : {}}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.button>
);

// Enhanced pagination controls with animations
const PaginationControls = ({ page, handleChangePage, rowsPerPage, count }) => {
  const pageCount = Math.ceil(count / rowsPerPage);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        0,
        Math.min(page - 2, pageCount - maxVisiblePages)
      );
      const endPage = Math.min(pageCount, startPage + maxVisiblePages);

      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) {
          pages.push("left-ellipsis");
        }
      }

      for (let i = startPage; i < endPage; i++) {
        pages.push(i);
      }

      if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
          pages.push("right-ellipsis");
        }
        pages.push(pageCount - 1);
      }
    }

    return pages;
  };

  return (
    <motion.div
      className="flex items-center space-x-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PaginationButton
        onClick={() => handleChangePage(0)}
        disabled={page === 0}
      >
        <FiChevronsLeft />
      </PaginationButton>

      <PaginationButton
        onClick={() => handleChangePage(page - 1)}
        disabled={page === 0}
      >
        <FiChevronLeft />
      </PaginationButton>

      <AnimatePresence initial={false}>
        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === "left-ellipsis" || pageNumber === "right-ellipsis" ? (
            <motion.div
              key={index}
              className="w-10 h-10 flex items-center justify-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FaEllipsisH />
            </motion.div>
          ) : (
            <motion.div
              key={pageNumber}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <PaginationButton
                onClick={() => handleChangePage(pageNumber)}
                active={page === pageNumber}
              >
                {pageNumber + 1}
              </PaginationButton>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <PaginationButton
        onClick={() => handleChangePage(page + 1)}
        disabled={page >= pageCount - 1}
      >
        <FiChevronRight />
      </PaginationButton>

      <PaginationButton
        onClick={() => handleChangePage(pageCount - 1)}
        disabled={page >= pageCount - 1}
      >
        <FiChevronsRight />
      </PaginationButton>
    </motion.div>
  );
};

// Usage in your component
export const EnhancedPagination = ({
  page,
  rowsPerPage,
  count,
  handleChangePage,
  handleChangeRowsPerPage,
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
    <RowsPerPageSelector
      rowsPerPage={rowsPerPage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    />

    <div className="text-sm text-gray-600">
      Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{" "}
      <span className="font-medium">
        {Math.min((page + 1) * rowsPerPage, count)}
      </span>{" "}
      of <span className="font-medium">{count}</span> entries
    </div>

    <PaginationControls
      page={page}
      handleChangePage={handleChangePage}
      rowsPerPage={rowsPerPage}
      count={count}
    />
  </div>
);
