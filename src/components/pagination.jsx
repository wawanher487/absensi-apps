export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxVisiblePages = 10;
  const pageNumbers = [];

  let startPage = Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const canGoBack = startPage > 1;
  const canGoNext = endPage < totalPages;

  return (
    <div className="flex justify-center items-center space-x-1 mt-4 flex-wrap">
      {/* Tombol blok sebelumnya */}
      {canGoBack && (
        <button
          onClick={() => onPageChange(startPage - 1)}
          className="px-3 py-1 rounded bg-gray-200 text-blue-700 hover:bg-gray-300"
        >
          &laquo;
        </button>
      )}

      {/* Tombol nomor halaman */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded ${
            currentPage === page
              ? "bg-blue-700 text-white"
              : "bg-white border text-blue-700"
          } hover:bg-blue-600 hover:text-white`}
        >
          {page}
        </button>
      ))}

      {/* Tombol blok berikutnya */}
      {canGoNext && (
        <button
          onClick={() => onPageChange(endPage + 1)}
          className="px-3 py-1 rounded bg-gray-200 text-blue-700 hover:bg-gray-300"
        >
          &raquo;
        </button>
      )}
    </div>
  );
}
