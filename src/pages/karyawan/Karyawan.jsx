import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localApi } from "../../api/axiosInstance";
import EditKaryawan from "./EditKaryawan";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";

const Karyawan = () => {
  const [karyawans, setKaryawans] = useState([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const navigate = useNavigate();

  const fetchKaryawan = async () => {
    try {
      const res = await localApi.get("/karyawan/get");
      setKaryawans(res.data.data);
    } catch (error) {
      console.error("Gagal ambil data karyawan:", error);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  const handleEdit = (karyawan) => {
    setSelectedKaryawan(karyawan);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await localApi.delete(`/karyawan/delete/${confirmDeleteId}`);
      toast.success("Berhasil update data.");
      fetchKaryawan(); // Refresh data
    } catch (error) {
      console.error("Gagal hapus karyawan:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Karyawan</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded">
          + Tambah Karyawan
        </button>
      </div>

      {/* Tabel Filter */}
      <div className="flex gap-2 mb-4">
        <select className="border px-3 py-2 rounded">
          <option>Pilih Divisi</option>
        </select>
        <select className="border px-3 py-2 rounded">
          <option>Pilih Jabatan</option>
        </select>
        <input
          type="text"
          placeholder="Cari..."
          className="border px-3 py-2 rounded w-60"
        />
        <button className="bg-blue-700 text-white px-4 py-2 rounded">
          Cari
        </button>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">NIP</th>
              <th className="px-4 py-3">No. Telp</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Alamat</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {karyawans.map((k, index) => (
              <tr
                key={k.id}
                className="hover:bg-gray-200 transition cursor-pointer"
                onClick={() => navigate(`/app/karyawan/${k.id}`)}
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{k.nama}</td>
                <td className="px-4 py-3">{k.nip}</td>
                <td className="px-4 py-3">{k.phoneNumber}</td>
                <td className="px-4 py-3">{k.unit}</td>
                <td className="px-4 py-3">{k.address}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(k);
                      }}
                      className="bg-blue-700 text-white px-4 py-1 rounded font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(k.id);
                      }}
                      className="bg-red-600 text-white px-4 py-1 rounded font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {karyawans.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data karyawan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {showModal && selectedKaryawan && (
        <EditKaryawan
          karyawan={selectedKaryawan}
          onClose={() => setShowModal(false)}
          onUpdate={() => {
            fetchKaryawan();
            setShowModal(false);
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data karyawan ini?"
      />
    </div>
  );
};

export default Karyawan;
