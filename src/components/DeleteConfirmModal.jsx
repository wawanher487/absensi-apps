const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, message = "Apakah Anda yakin ingin menghapus item ini?" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[400px] text-center">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Konfirmasi Hapus</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
