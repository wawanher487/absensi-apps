import { useEffect, useState } from "react";
import { localApi } from "../api/axiosInstance";
import { CameraIcon, BrainCircuit, UserCheck, AlarmClock } from "lucide-react";
import dayjs from "dayjs";

const DashboardPresensi = () => {
  const [stats, setStats] = useState({
    kamera: 0,
    ai: 0,
    hadir: 0,
    telat: 0,
  });

  const [topEarly, setTopEarly] = useState([]);
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const today = dayjs().format("DD-MM-YYYY");
      setTanggal(today);

      try {
        const res = await localApi.get(`/history/get?tanggal=${today}`);
        setStats((prev) => ({ ...prev, kamera: res.data.totalItems || 0 }));
      } catch (err) {
        console.error("Gagal memuat total kamera:", err);
      }

      try {
        const resAi = await localApi.get(`/history_ai/get?tanggal=${today}`);
        setStats((prev) => ({ ...prev, ai: resAi.data.totalItems || 0 }));
      } catch (err) {
        console.error("Gagal memuat total AI:", err);
      }

      try {
        const resTop = await localApi.get(
          `/history_ai/top_erly?tanggal=${today}`
        );
        setTopEarly(resTop.data.data || []);
      } catch (err) {
        console.error("Gagal memuat data top datang paling awal:", err);
      }

      try {
        const resStatus = await localApi.get(
          `/history_ai/status_kehadiran?tanggal=${today}`
        );
        const totalHadir = resStatus.data?.data?.totalHadir || 0;
        const totalTelat = resStatus.data?.data?.totalTelat || 0;

        setStats((prev) => ({
          ...prev,
          hadir: totalHadir,
          telat: totalTelat,
        }));
      } catch (err) {
        console.error("Gagal memuat data kehadiran/telat:", err);
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <p>Memuat data dashboard...</p>;

  const cards = [
    {
      title: "Total Data Kamera",
      value: stats.kamera,
      icon: <CameraIcon className="text-blue-600 w-7 h-7" />,
      color: "bg-blue-100",
    },
    {
      title: "Total Data AI",
      value: stats.ai,
      icon: <BrainCircuit className="text-purple-600 w-7 h-7" />,
      color: "bg-purple-100",
    },
    {
      title: "Total Kehadiran",
      value: stats.hadir,
      icon: <UserCheck className="text-green-600 w-7 h-7" />,
      color: "bg-green-100",
    },
    {
      title: "Total Keterlambatan",
      value: stats.telat,
      icon: <AlarmClock className="text-red-600 w-7 h-7" />,
      color: "bg-red-100",
    },
  ];

  return (
    <div className="p-6  bg-gray-100 min-h-screen">
      {/* Tanggal Hari Ini */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Tanggal Kehadiran : {tanggal}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 flex items-center space-x-4"
          >
            <div className={`${card.color} p-3 rounded-full`}>{card.icon}</div>
            <div>
              <h4 className="text-md font-semibold text-gray-700">
                {card.title}
              </h4>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔽 Daftar Karyawan yang hadir */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Daftar Kehadiran Hari Ini
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr className="text-left">
                <th className="px-6 py-3 border-b">No</th>
                <th className="px-6 py-3 border-b">Nama</th>
                <th className="px-6 py-3 border-b">Waktu Datang</th>
                <th className="px-6 py-3 border-b">Status</th>
                <th className="px-6 py-3 border-b text-center">Foto</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {topEarly.length > 0 ? (
                topEarly.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors text-left"
                  >
                    <td className="px-6 py-3 border-b">{index + 1}</td>
                    <td className="px-6 py-3 border-b capitalize">
                      {item.nama}
                    </td>
                    <td className="px-6 py-3 border-b">
                      {item.jam_masuk_actual}
                    </td>
                    <td className="px-6 py-3 space-x-1 border-b">
                      {Array.isArray(item.status_absen) &&
                      item.status_absen.length > 0 ? (
                        item.status_absen.map((status, i) => {
                          const s = status?.toLowerCase() || "";
                          return (
                            <span
                              key={i}
                              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                s === "terlambat"
                                  ? "bg-red-100 text-red-800"
                                  : s === "pulang"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : s === "hadir"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {status}
                            </span>
                          );
                        })
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded-full">
                          Tidak Ada Status
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3 border-b text-center">
                      <button
                        onClick={() => setSelectedUser(item)}
                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                      >
                        Lihat Foto
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Tidak ada data hadir hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                Detail Foto
              </h4>
              <div className="flex flex-col items-center space-y-3">
                <img
                  src={`https://monja-file.pptik.id/v1/view?path=presensi/${selectedUser.gambar}`}
                  alt={selectedUser.nama}
                  className="w-120 h-120 object-cover rounded-lg border"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPresensi;
