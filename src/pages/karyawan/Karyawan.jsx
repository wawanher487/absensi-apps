import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localApi } from "../../api/axiosInstance";
import EditKaryawan from "./EditKaryawan";
import TambahKaryawan from "./TambahKaryawan";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";

const Karyawan = () => {
  const [karyawans, setKaryawans] = useState([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);

  const [filterNama, setFilterNama] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterNip, setFilterNip] = useState("");
  const [unitOptions, setUnitOptions] = useState([]);

  const navigate = useNavigate();

  const fetchKaryawan = async () => {
    try {
      const params = new URLSearchParams();
      if (filterNama) params.append("nama", filterNama);
      if (filterUnit) params.append("unit", filterUnit);
      if (filterNip) params.append("nip", filterNip);

      const res = await localApi.get(`/karyawan/get?${params.toString()}`);
      setKaryawans(res.data.data);

      // Set unit options dari data karyawan
      const uniqueUnits = [...new Set(res.data.data.map((k) => k.unit))];
      setUnitOptions(uniqueUnits);
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
      fetchKaryawan();
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
        <button
          onClick={() => navigate("/app/karyawan/tambah")}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Tambah Karyawan
        </button>
      </div>
      {/* Tabel Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          className="border px-3 py-2 rounded"
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
        >
          <option value="">Pilih Unit</option>
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Cari Nama..."
          className="border px-3 py-2 rounded w-60"
          value={filterNama}
          onChange={(e) => setFilterNama(e.target.value)}
        />
        {/* <input
          type="text"
          placeholder="Cari NIP..."
          className="border px-3 py-2 rounded w-60"
          value={filterNip}
          onChange={(e) => setFilterNip(e.target.value)}
        /> */}
        <button
          onClick={fetchKaryawan}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
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
                      Hapus
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
      {/* Modal Tambah */}
      {showTambahModal && (
        <TambahKaryawan
          onClose={() => setShowTambahModal(false)}
          onSuccess={() => {
            fetchKaryawan();
            setShowTambahModal(false);
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
