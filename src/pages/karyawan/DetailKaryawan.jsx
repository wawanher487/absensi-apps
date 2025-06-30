import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { localApi } from "../../api/axiosInstance";

const DetailKaryawan = () => {
  const { id } = useParams();
  const [karyawan, setKaryawan] = useState(null);
  const [presensi, setPresensi] = useState([]);

  useEffect(() => {
    fetchKaryawan();
  }, [id]);

  useEffect(() => {
    if (karyawan?.userGuid) {
      fetchPresensi();
    }
  }, [karyawan]);

  const fetchKaryawan = async () => {
    try {
      const res = await localApi.get(`/karyawan/get/${id}`);
      setKaryawan(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data karyawan", err);
    }
  };

  const fetchPresensi = async () => {
    try {
      const res = await localApi.get(`/history_ai/get/${karyawan.userGuid}`);
      setPresensi(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data presensi", err);
    }
  };

  if (!karyawan) return <p className="p-6">Loading...</p>;

  const totalHadir = presensi.filter((p) => p.status === "hadir").length;
  const totalGaji = totalHadir * (karyawan.gajiHarian || 0);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Detail Karyawan</h2>
      {/* Profil */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex-shrink-0">
          <div className="w-52 h-64 rounded-xl overflow-hidden border-2 border-gray-300 shadow-sm">
            <img
              src={`https://monja-file.pptik.id/v1/view?path=${karyawan.gambar}`}
              alt="Foto Karyawan"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-base w-full">
          <p>
            <span className="font-semibold">Nama:</span> {karyawan.nama}
          </p>
          <p>
            <span className="font-semibold">NIP:</span> {karyawan.nip}
          </p>
          <p>
            <span className="font-semibold">Jabatan:</span> {karyawan.jabatan}
          </p>
          <p>
            <span className="font-semibold">Unit:</span> {karyawan.unit}
          </p>
          <p>
            <span className="font-semibold">Gender:</span>{" "}
            {karyawan.gender === "L" ? "Laki-laki" : "Perempuan"}
          </p>
          <p>
            <span className="font-semibold">Tanggal Lahir:</span>{" "}
            {karyawan.birthDate}
          </p>
          <p>
            <span className="font-semibold">Telepon:</span>{" "}
            {karyawan.phoneNumber}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {karyawan.status ? "Aktif" : "Tidak Aktif"}
          </p>
          <p className="sm:col-span-2">
            <span className="font-semibold">Alamat:</span> {karyawan.address}
          </p>
        </div>
      </div>
      {/* Statistik */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">
          Rekap Kehadiran 30 Hari Terakhir
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <p>
            <span className="font-medium">Total Hadir:</span> {totalHadir} hari
          </p>
          <p>
            <span className="font-medium">Gaji Harian:</span> Rp{" "}
            {karyawan.gajiHarian?.toLocaleString("id-ID")}
          </p>
          <p>
            <span className="font-medium">Total Gaji:</span>{" "}
            <strong>Rp {totalGaji.toLocaleString("id-ID")}</strong>
          </p>
        </div>
      </div>
      {/* Tabel Presensi */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Daftar Presensi</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presensi.slice(0, 30).map((p, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    {new Date(p.timestamp).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-2 capitalize">{p.status}</td>
                  <td className="px-4 py-2">{p.keterangan || "-"}</td>
                </tr>
              ))}
              {presensi.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-3 text-gray-500">
                    Tidak ada data presensi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailKaryawan;
