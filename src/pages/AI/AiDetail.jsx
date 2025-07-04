import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";
import { formatTanggalWaktu, toDatetimeLocal } from "../../utils/date";

export default function DetailAI() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aiData, setAiData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await localApi.get(`/history_ai/get/${id}`);
        const data = res.data?.data;
        if (data) {
          setAiData(data);
          setFormData(data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail data AI:", err);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const {
      nama,
      guid_device,
      unit,
      jam_masuk,
      jam_keluar,
      jam_masuk_actual,
      jam_keluar_actual,
      jumlah_telat,
      total_jam_telat,
      status_absen,
      process,
      datetime,
    } = formData;

    const payload = {
      nama,
      guid_device,
      unit,
      jam_masuk,
      jam_keluar,
      jam_masuk_actual,
      jam_keluar_actual,
      jumlah_telat: Number(jumlah_telat),
      total_jam_telat: Number(total_jam_telat),
      status_absen,
      process,
      datetime, // hanya jika datetime bisa diedit
    };

    try {
      const res = await localApi.patch(`/history_ai/update/${id}`, payload);
      setAiData(res.data.data);
      setIsEditing(false);
      toast.success("Data berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal mengupdate data:", err.response?.data || err);
      toast.error("Gagal memperbarui data.");
    }
  };

  const handleDelete = () => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    try {
      await localApi.delete(`/history_ai/delete/${confirmDeleteId}`);
      toast.success("Berhasil menghapus data.");
      navigate("/app/ai");
    } catch (error) {
      console.error("Gagal menghapus data history:", error);
      toast.error("Gagal menghapus data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const formatTelat = (menitTotal) => {
    if (!menitTotal || isNaN(menitTotal)) return "-";
    const jam = Math.floor(menitTotal / 60);
    const menit = menitTotal % 60;
    return [jam && `${jam} jam`, menit && `${menit} menit`]
      .filter(Boolean)
      .join(" ");
  };

  const renderField = (label, name, type = "text") => (
    <div>
      <strong>{label}:</strong>{" "}
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full mt-1"
        />
      ) : (
        aiData[name] || "-"
      )}
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div>
      <strong>{label}:</strong>{" "}
      {isEditing ? (
        <select
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full mt-1"
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        aiData[name] || "-"
      )}
    </div>
  );

  const renderDatetimeField = (label, name) => (
    <div>
      <strong>{label}:</strong>{" "}
      {isEditing ? (
        <input
          type="datetime-local"
          name={name}
          value={toDatetimeLocal(formData[name])}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full mt-1"
        />
      ) : (
        formatTanggalWaktu(aiData[name])
      )}
    </div>
  );

  const formatInputDatetime = (datetime) => {
    if (!datetime) return "";
    const dt = new Date(datetime);
    return dt.toISOString().slice(0, 16); // Format ke YYYY-MM-DDTHH:mm
  };

  if (!aiData || !formData) {
    return <div className="p-6">Memuat detail data AI...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Detail AI - {aiData.nama}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded font-bold text-gray-800"
        >
          Kembali
        </button>
      </div>

      <div className="bg-white rounded shadow p-8 flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 text-base space-y-3">
          {renderField("Nama", "nama")}
          {renderField("Device", "guid_device")}
          {renderField("Jam Masuk", "jam_masuk")}
          {renderField("Waktu Datang", "jam_masuk_actual")}
          {renderField("Jam Pulang", "jam_keluar")}
          {renderField("Waktu Pulang", "jam_keluar_actual")}
          <div>
            <strong>Keterlambatan:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                name="total_jam_telat"
                value={formData.total_jam_telat || ""}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full mt-1"
              />
            ) : (
              formatTelat(aiData.total_jam_telat)
            )}
          </div>
          {renderSelect("Status Absen", "status_absen", [
            { value: "", label: "-- Pilih --" },
            { value: "hadir", label: "Hadir" },
            { value: "terlambat", label: "Terlambat" },
            { value: "tidak hadir", label: "Tidak Hadir" },
            { value: "tidak dikenali", label: "Tidak Dikenali" },
          ])}
          {renderSelect("Proses", "process", [
            { value: "done", label: "Selesai" },
            { value: "pending", label: "Belum" },
          ])}
          {renderDatetimeField("Tanggal & Waktu", "datetime")}

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
                    setFormData(aiData);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Data
                </button>
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
          {aiData.gambar ? (
            <img
              src={`https://monja-file.pptik.id/v1/view?path=presensi/${aiData.gambar}`}
              alt="Gambar AI"
              className="rounded w-full object-contain"
            />
          ) : (
            <div className="w-full h-60 bg-gray-300 flex items-center justify-center text-gray-600 text-lg rounded">
              Tidak ada gambar
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data AI ini?"
      />
    </div>
  );
}
