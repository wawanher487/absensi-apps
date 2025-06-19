export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? "bg-blue-700 text-white"
              : "bg-white border text-blue-700"
          } hover:bg-blue-600 hover:text-white`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
