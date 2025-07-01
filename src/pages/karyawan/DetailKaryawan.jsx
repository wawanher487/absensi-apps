import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { localApi } from "../../api/axiosInstance";
import {
  BadgeInfo,
  MapPin,
  Phone,
  User,
  Building2,
  Cake,
  DollarSign,
  Users,
  Clock,
  XCircle,
} from "lucide-react";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import EditKaryawan from "./EditKaryawan";
import { toast } from "react-toastify";

const DetailKaryawan = () => {
  const { id } = useParams();
  const [karyawan, setKaryawan] = useState(null);
  const [presensi, setPresensi] = useState([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const today = new Date();
  const [bulan, setBulan] = useState(today.getMonth() + 1);
  const [tahun, setTahun] = useState(today.getFullYear());

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
      toast.success("Berhasil menghapus data.");
      fetchKaryawan();
    } catch (error) {
      console.error("Gagal hapus karyawan:", error);
      toast.error("Gagal menghapus data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [id]);

  useEffect(() => {
    if (karyawan?.userGuid) {
      fetchPresensi(bulan, tahun);
    }
  }, [karyawan, bulan, tahun]);

  const fetchKaryawan = async () => {
    try {
      const res = await localApi.get(`/karyawan/get/${id}`);
      setKaryawan(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data karyawan", err);
    }
  };

  const fetchPresensi = async (bulanQuery = bulan, tahunQuery = tahun) => {
    if (!karyawan?.userGuid) return;

    console.log("Fetching presensi:", {
      userGuid: karyawan.userGuid,
      bulan: bulanQuery,
      tahun: tahunQuery,
    });

    try {
      const res = await localApi.get(
        `/history_ai/riwayat_bulanan?userGuid=${
          karyawan.userGuid
        }&bulan=${String(bulanQuery).padStart(2, "0")}&tahun=${tahunQuery}`
      );
      setPresensi(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data presensi", err.response?.data || err);
      setPresensi([]);
    }
  };

  if (!karyawan) return <div className="p-6">Loading...</div>;

  const hariKerja = generateHariKerja(bulan, tahun);

  const tanggalHadir = presensi.map((p) => {
    const [dd, mm, yyyy] = p.datetime.split(" ")[0].split("-");
    return `${yyyy}-${mm}-${dd}`;
  });

  let totalTidakHadir = 0;
  if (presensi.length > 0) {
    const tidakHadir = hariKerja.filter((tgl) => !tanggalHadir.includes(tgl));
    totalTidakHadir = tidakHadir.length;
  }

  const totalHadirTepatWaktu = presensi.filter(
    (p) => p.status_absen === "hadir"
  ).length;

  const totalTerlambat = presensi.filter(
    (p) => p.status_absen === "terlambat"
  ).length;

  const totalHariMasuk = totalHadirTepatWaktu + totalTerlambat;

  const totalGaji = totalHariMasuk * (karyawan.gajiHarian || 0);

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profil Header */}
      <div className="bg-white p-6 rounded-xl shadow flex flex-col lg:flex-row items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-200 text-center flex items-center justify-center text-white text-xl font-bold">
            {karyawan.gambar ? (
              <img
                src={`https://monja-file.pptik.id/v1/view?path=${karyawan.gambar}`}
                alt="Foto"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>Foto</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {karyawan.nama}
            </h1>
            <p className="text-blue-600 text-sm font-medium">
              {karyawan.jabatan}
            </p>
            <span
              className={`mt-1 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                karyawan.status
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {karyawan.status ? "Aktif" : "Tidak Aktif"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => handleDelete(karyawan._id)}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded font-medium"
          >
            Hapus
          </button>
          <button
            onClick={() => handleEdit(karyawan)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-md text-sm"
          >
            Edit Profil
          </button>
        </div>
      </div>

      {/* Detail Informasi & Gaji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-4">Detail Informasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p className="flex items-center gap-2">
              <Users size={16} /> <strong>NIP:</strong> {karyawan.nip}
            </p>
            <p className="flex items-center gap-2">
              <Building2 size={16} /> <strong>Unit:</strong> {karyawan.unit}
            </p>
            <p className="flex items-center gap-2">
              <User size={16} /> <strong>Jenis Kelamin:</strong>{" "}
              {karyawan.gender === "L" ? "Laki-laki" : "Perempuan"}
            </p>
            <p className="flex items-center gap-2">
              <Cake size={16} /> <strong>Tanggal Lahir:</strong>{" "}
              {formatTanggal(karyawan.birthDate)}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> <strong>Telepon:</strong>{" "}
              {karyawan.phoneNumber}
            </p>
            <p className="sm:col-span-2 flex items-center gap-2">
              <MapPin size={16} /> <strong>Alamat:</strong> {karyawan.address}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-4">Rekap Gaji & Kehadiran</h2>
          <div className="text-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Users size={16} /> Total Hari Masuk
              </span>
              <strong>{totalHariMasuk} hari</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <User size={16} /> Hadir Tepat Waktu
              </span>
              <strong>{totalHadirTepatWaktu} hari</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Clock size={16} /> Terlambat
              </span>
              <strong>{totalTerlambat} hari</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <XCircle size={16} /> Tidak Hadir
              </span>
              <strong>{totalTidakHadir} hari</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <DollarSign size={16} /> Gaji Harian
              </span>
              <strong>Rp {karyawan.gajiHarian?.toLocaleString("id-ID")}</strong>
            </div>
            <div className="flex justify-between items-center text-blue-600 font-semibold bg-blue-50 p-2 rounded-md mt-3">
              <span className="flex items-center gap-2">
                <BadgeInfo size={16} /> Estimasi Total Gaji
              </span>
              <span>Rp {totalGaji.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Presensi */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-4">Riwayat Kehadiran</h2>
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="border rounded p-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="border rounded p-2 text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Jam Masuk</th>
                <th className="px-4 py-2">Jam Pulang</th>
                <th className="px-4 py-2">Keterlambatan</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {presensi.length > 0 ? (
                presensi.slice(0, 30).map((p, i) => {
                  const tanggal = new Date(
                    ...p.datetime.split(" ")[0].split("-").reverse().map(Number)
                  );
                  const jamMasuk = p.jam_masuk_actual || "-";
                  const jamPulang = p.jam_keluar_actual || "-";
                  const status = p.status_absen;
                  const telat = p.total_jam_telat || "-";

                  return (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {tanggal.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        <div className="text-xs text-gray-400">
                          Seharusnya: 08:00:00
                        </div>
                      </td>
                      <td className="px-4 py-2">{jamMasuk}</td>
                      <td className="px-4 py-2">{jamPulang}</td>
                      <td className="px-4 py-2">
                        {typeof telat === "number" && telat > 0
                          ? telat >= 60
                            ? `${Math.floor(telat / 60)} jam ${
                                telat % 60 !== 0 ? `${telat % 60} menit` : ""
                              }`
                            : `${telat} menit`
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            status === "hadir"
                              ? "bg-green-100 text-green-700"
                              : status === "terlambat"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Belum ada data kehadiran untuk bulan{" "}
                    {new Date(0, bulan - 1).toLocaleString("id-ID", {
                      month: "long",
                    })}{" "}
                    {tahun}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        message="Apakah Anda yakin ingin menghapus data karyawan ini?"
      />
    </div>
  );
};

function generateHariKerja(bulan, tahun) {
  const hariKerja = [];
  const today = new Date();
  const isCurrentMonth =
    bulan === today.getMonth() + 1 && tahun === today.getFullYear();
  const totalHari = new Date(tahun, bulan, 0).getDate();

  for (let tgl = 1; tgl <= totalHari; tgl++) {
    const date = new Date(tahun, bulan - 1, tgl);
    const day = date.getDay(); // 0: Minggu, 6: Sabtu

    if (day >= 1 && day <= 5) {
      if (isCurrentMonth && date > today) continue; // Lewati hari kerja di masa depan
      hariKerja.push(date.toISOString().slice(0, 10));
    }
  }

  return hariKerja;
}

export default DetailKaryawan;
