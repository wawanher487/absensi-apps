import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { toast } from "react-toastify";
import { ArrowLeft, CameraOff, Calendar } from "lucide-react";

export default function DetailKamera() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kameraData, setKameraData] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await localApi.get(`/history/get/${id}`);
        if (res.data && res.data.data) {
          setKameraData(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail kamera:", err);
        toast.error("Gagal memuat data kamera.");
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = () => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    try {
      await localApi.delete(`/history/delete/${confirmDeleteId}`);
      toast.success("Berhasil menghapus data.");
      navigate("/app/kamera");
    } catch (error) {
      console.error("Gagal menghapus data history:", error);
      toast.error("Gagal menghapus data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (!kameraData) {
    return (
      <div className="p-6 md:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat detail data kamera...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Detail Kamera
          </h1>
          <p className="text-sm text-slate-500">Informasi lengkap perangkat</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-sm rounded-md font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {/* Konten Utama */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Kolom Kiri */}
          <div className="lg:col-span-2 space-y-4 text-sm md:text-base text-slate-700">
            <div>
              <h2 className="font-semibold mb-1">ID Kamera</h2>
              <p className="text-slate-900 font-medium">{kameraData.id}</p>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Device</h2>
              <p className="text-slate-900 font-medium">
                {kameraData.guid_device || "-"}
              </p>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Waktu terdeteksi</h2>
              <p className="text-slate-900 font-medium">
                {formatTanggalWaktu(kameraData.datetime)}
              </p>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Status Proses AI</h2>
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                  kameraData.process
                    ? "bg-sky-100 text-sky-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {kameraData.process ? "Sudah" : "Belum"}
              </span>
            </div>

            {/* Tombol */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md font-semibold transition-colors"
              >
                Hapus Data
              </button>
            </div>
          </div>

          {/* Kolom Kanan - Gambar */}
          <div className="w-full h-auto flex flex-col items-center justify-start">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 w-full">
              Foto Presensi
            </h2>
            <div className="w-full aspect-square rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {kameraData.gambar ? (
                <img
                  src={`https://monja-file.pptik.id/v1/view?path=presensi/${kameraData.gambar}`}
                  alt="Gambar Kamera"
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

      {/* Modal konfirmasi hapus */}
      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data kamera ini?"
      />
    </div>
  );
}

export function formatTanggalWaktu(datetimeStr) {
  // Misalnya datetimeStr = "07-10-2025 13:07:19"
  const [tanggal, waktu] = datetimeStr.split(" ");
  const [dd, mm, yyyy] = tanggal.split("-");

  // Buat objek Date manual agar bisa ambil hari (untuk nama hari)
  const dateObj = new Date(`${yyyy}-${mm}-${dd}T${waktu}`);

  const hariIndo = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const namaHari = hariIndo[dateObj.getDay()];

  return `${namaHari}, ${dd} ${getNamaBulan(mm)} ${yyyy} pukul ${waktu}`;
}

function getNamaBulan(bulan) {
  const bulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const index = parseInt(bulan, 10) - 1;
  return bulanIndo[index] || "-";
}
