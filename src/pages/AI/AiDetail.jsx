import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Pastikan Anda menginstal lucide-react: npm install lucide-react
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  User,
  Clock,
  Calendar,
  CameraOff,
} from "lucide-react";
// Asumsi localApi, DeleteConfirmModal, dan utils sudah ada di proyek Anda
import { localApi } from "../../api/axiosInstance";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";
import { formatTanggalWaktu, toDatetimeLocal } from "../../utils/date";
import ImageWithFallback from "../../components/ImageWithFallback";

// Komponen kecil untuk menampilkan field form (lebih rapi)
const FormField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  options = [],
  multiple = false, // <- tambahkan ini
}) => {
  const commonInputClass =
    "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";

  const renderEditingView = () => {
    if (type === "select") {
      return (
        <select
          name={name}
          value={value || (multiple ? [] : "")}
          onChange={onChange}
          multiple={multiple}
          className={commonInputClass}
        >
          {!multiple && <option value="">-- Pilih Status --</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className={commonInputClass}
      />
    );
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-600"
      >
        {label}
      </label>
      {isEditing ? (
        renderEditingView()
      ) : (
        <p className="mt-1 text-sm text-slate-900 font-semibold">
          {Array.isArray(value) ? value.join(", ") : value || "-"}
        </p>
      )}
    </div>
  );
};

// Komponen untuk badge status
const StatusBadge = ({ status }) => {
  const statusMap = {
    hadir: "bg-green-100 text-green-800",
    terlambat: "bg-red-100 text-red-800",
    pulang: "bg-yellow-100 text-yellow-800",
    "tidak dikenali": "bg-gray-100 text-gray-800",
    done: "bg-sky-100 text-sky-800",
    pending: "bg-orange-100 text-orange-800",
  };
  const style = statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};

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
        const res = await localApi.get(`/history_ai/user/${id}`);
        const data = res.data?.data;
        if (data) {
          // Siapkan form data dengan nilai yang sudah diformat untuk input datetime-local
          const preparedFormData = {
            ...data,
            datetime: toDatetimeLocal(data.datetime),
            status_absen: Array.isArray(data.status_absen)
              ? data.status_absen
              : [data.status_absen],
          };
          setAiData(data);
          setFormData(preparedFormData);
        }
      } catch (err) {
        console.error("Gagal mengambil detail data AI:", err);
        toast.error("Gagal memuat data.");
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      jam_masuk: formData.jam_masuk,
      jam_keluar: formData.jam_keluar,
      jam_masuk_actual: formData.jam_masuk_actual,
      jam_keluar_actual: formData.jam_keluar_actual,
      datetime: formData.datetime,
      jumlah_telat: Number(formData.jumlah_telat),
      total_jam_telat: Number(formData.total_jam_telat),
      status_absen: formData.status_absen,
      process: formData.process,
    };

    try {
      const res = await localApi.patch(`/history_ai/update/${id}`, payload);
      // Format ulang data yang diterima untuk tampilan
      const updatedData = res.data.data;
      const preparedFormData = {
        ...updatedData,
        datetime: toDatetimeLocal(updatedData.datetime),
      };
      setAiData(updatedData);
      setFormData(preparedFormData);
      setIsEditing(false);
      alert("Data berhasil diperbarui.");
      toast.success("Data berhasil diperbarui.");
      navigate(`/app/ai`);
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
    if (menitTotal === null || isNaN(menitTotal) || menitTotal === 0)
      return "Tepat Waktu";
    const jam = Math.floor(menitTotal / 60);
    const menit = menitTotal % 60;
    return [jam > 0 && `${jam} jam`, menit > 0 && `${menit} menit`]
      .filter(Boolean)
      .join(" ");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      ...aiData,
      datetime: aiData.datetime ? toDatetimeLocal(aiData.datetime) : "",
    });
  };

  if (!aiData || !formData) {
    return (
      <div className="p-6 md:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat detail data AI...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Detail Absensi AI
          </h1>
          <p className="text-sm text-slate-500">
            Detail lengkap untuk {aiData.nama}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-sm rounded-md font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Kolom Kiri: Detail Data */}
          <div className="lg:col-span-2">
            {/* Informasi Karyawan */}
            <div className="border-b border-slate-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <User size={20} /> Informasi Karyawan
              </h2>
              {aiData.user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Nama Karyawan"
                    name="user_name"
                    value={aiData.user.name}
                    isEditing={false}
                  />
                  <FormField
                    label="NIP"
                    name="user_nip"
                    value={aiData.user.nip}
                    isEditing={false}
                  />
                  <FormField
                    label="Unit"
                    name="user_unit"
                    value={aiData.user.unit}
                    isEditing={false}
                  />
                  <FormField
                    label="Device"
                    name="guid_device"
                    value={aiData.guid_device}
                    isEditing={false}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <p className="font-semibold">Bukan Karyawan</p>
                  <p className="text-sm">
                    Wajah ini tidak terdaftar sebagai karyawan.
                  </p>
                </div>
              )}
            </div>

            {/* Detail Absensi */}
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Clock size={20} /> Detail Waktu
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  label="Jam Masuk Seharusnya"
                  name="jam_masuk"
                  value={formData.jam_masuk}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <FormField
                  label="Waktu Datang Aktual"
                  name="jam_masuk_actual"
                  value={formData.jam_masuk_actual}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <FormField
                  label="Jam Pulang Seharusnya"
                  name="jam_keluar"
                  value={formData.jam_keluar}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <FormField
                  label="Waktu Pulang Aktual"
                  name="jam_keluar_actual"
                  value={formData.jam_keluar_actual}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <FormField
                  label="Total Keterlambatan (menit)"
                  name="total_jam_telat"
                  value={
                    isEditing
                      ? formData.total_jam_telat
                      : formatTelat(aiData.total_jam_telat)
                  }
                  isEditing={isEditing}
                  onChange={handleChange}
                  type="number"
                />
                <FormField
                  label="Tanggal & Waktu Absen"
                  name="datetime"
                  value={
                    isEditing
                      ? formData.datetime
                      : formatTanggalWaktu(aiData.datetime)
                  }
                  isEditing={isEditing}
                  onChange={handleChange}
                  type="datetime-local"
                />
              </div>
            </div>

            {/* Status & Proses */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Calendar size={20} /> Status & Proses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600">
                    Status Absen
                  </label>
                  {isEditing ? (
                    <FormField
                      name="status_absen"
                      value={formData.status_absen}
                      isEditing={true}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setFormData((prev) => ({
                          ...prev,
                          status_absen: selected,
                        }));
                      }}
                      type="select"
                      options={[
                        { value: "Hadir", label: "Hadir" },
                        { value: "Terlambat", label: "Terlambat" },
                        { value: "Pulang", label: "Pulang" },
                        { value: "tidak dikenali", label: "Tidak Dikenali" },
                      ]}
                      multiple={true}
                    />
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Array.isArray(aiData.status_absen) ? (
                        aiData.status_absen.map((s, i) => (
                          <StatusBadge key={i} status={s} />
                        ))
                      ) : (
                        <StatusBadge status={aiData.status_absen} />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">
                    Status Proses
                  </label>
                  {isEditing ? (
                    <FormField
                      name="process"
                      value={formData.process}
                      isEditing={true}
                      onChange={handleChange}
                      type="select"
                      options={[
                        { value: "done", label: "Selesai" },
                        { value: "pending", label: "Belum" },
                      ]}
                    />
                  ) : (
                    <div className="mt-1">
                      <StatusBadge status={aiData.process} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 h-10 px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500"
                  >
                    <Save size={18} /> Simpan Perubahan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 h-10 px-4 py-2 bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400"
                  >
                    <X size={18} /> Batal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 h-10 px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-600"
                  >
                    <Edit size={18} /> Edit Data
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                  >
                    <Trash2 size={18} /> Hapus Data
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Gambar */}
          <div className="w-full h-auto flex flex-col items-center justify-start">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 w-full">
              Foto Absensi
            </h2>
            <div className="w-full aspect-square rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {aiData.gambar ? (
                <ImageWithFallback
                  filename={aiData.gambar}
                  alt={`Gambar ${aiData.nama}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <CameraOff size={48} className="mx-auto mb-2" />
                  <p>Tidak ada gambar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data absensi ini secara permanen?"
      />
    </div>
  );
}
