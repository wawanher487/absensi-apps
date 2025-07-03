import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";
import { formatTanggalWaktu, toDatetimeLocal } from "../../utils/date";

export default function DetailKamera() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kameraData, setKameraData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchDetailKamera = async () => {
      try {
        const res = await localApi.get(`/history/get/${id}`);
        if (res.data && res.data.data) {
          setKameraData(res.data.data);
          setFormData(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail kamera:", err);
      }
    };

    fetchDetailKamera();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await localApi.patch(`/history/update/${id}`, formData);
      setKameraData(res.data.data);
      setIsEditing(false);
      alert("Data berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal mengupdate data:", err);
      alert("Gagal memperbarui data.");
    }
  };

  const handleDelete = () => {
    setConfirmDeleteId(id); // Buka modal
  };

  const confirmDelete = async () => {
    try {
      await localApi.delete(`/history/delete/${confirmDeleteId}`);
      toast.success("Berhasil update data.");
      navigate("/app/kamera"); // Setelah hapus, kembali ke halaman list
    } catch (error) {
      console.error("Gagal menghapus data history:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (!kameraData) {
    return <div className="p-6">Memuat detail kamera...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Detail Kamera - {kameraData.id}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded font-bold text-gray-800"
        >
          Kembali
        </button>
      </div>

      <div className="bg-white rounded shadow p-8 flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 text-lg space-y-4">
          <div>
            <span className="font-semibold">ID:</span> {kameraData.id}
          </div>
          <div>
            <span className="font-semibold">Device:</span>{" "}
            {kameraData.guid_device}
          </div>

          <div>
            <span className="font-semibold">Tanggal & Waktu:</span>{" "}
            {isEditing ? (
              <input
                type="text"
                name="datetime"
                value={toDatetimeLocal(formData.datetime)}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full mt-1"
              />
            ) : (
              formatTanggalWaktu(kameraData.datetime)
            )}
          </div>
          {/* <div>
            <span className="font-semibold">Status:</span>{" "}
            {isEditing ? (
              <select
                name="checkStatus"
                value={formData.checkStatus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    checkStatus: e.target.value === "true",
                  }))
                }
                className="border px-2 py-1 rounded w-full mt-1"
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            ) : kameraData.checkStatus ? (
              "Aktif"
            ) : (
              "Tidak Aktif"
            )}
          </div> */}
          <div>
            <span className="font-semibold">Proses AI:</span>{" "}
            {isEditing ? (
              <select
                name="process"
                value={formData.process}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    process: e.target.value === "true",
                  }))
                }
                className="border px-2 py-1 rounded w-full mt-1"
              >
                <option value="true">Sudah</option>
                <option value="false">Belum</option>
              </select>
            ) : kameraData.process ? (
              "Sudah"
            ) : (
              "Belum"
            )}
          </div>

          <div className="flex gap-4 mt-4 flex-wrap">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(kameraData);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Hapus Data
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-[400px] h-auto flex justify-center items-center">
          {kameraData.gambar ? (
            <img
              src={`https://monja-file.pptik.id/v1/view?path=presensi/${kameraData.gambar}`}
              alt="Gambar Kamera"
              className="rounded w-full object-contain"
            />
          ) : (
            <div className="w-full h-60 bg-gray-300 flex items-center justify-center text-gray-600 text-lg rounded">
              Tidak ada gambar
            </div>
          )}
        </div>
      </div>

      {/*  Modal konfirmasi hapus */}
      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data kamera ini?"
      />
    </div>
  );
}
