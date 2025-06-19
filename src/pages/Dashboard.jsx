import React, { useEffect, useState } from "react";
import { localApi } from "../api/axiosInstance";
import { CameraIcon, BrainCircuit, UserCheck, AlarmClock } from "lucide-react";

const DashboardPresensi = () => {
  const [stats, setStats] = useState({
    kamera: 0,
    ai: 0,
    hadir: 0,
    telat: 0,
  });

  const [topEarly, setTopEarly] = useState([]); // ⬅️ Data 10 karyawan tercepat

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await localApi.get(`/history/get?page=1`);
        const totalKamera = res.data.totalItems || 0;

        const resaAi = await localApi.get(`/history_ai/get?page=1`);
        const totalAI = resaAi.data.totalItems || 0;

        // Ambil 5 data tercepat dari AI
        const early = resaAi.data.data?.slice(0, 5) || [];
        setTopEarly(early);

        // Dummy hadir/telat
        const totalHadir = 45;
        const totalTelat = 13;

        setStats({
          kamera: totalKamera,
          ai: totalAI,
          hadir: totalHadir,
          telat: totalTelat,
        });
      } catch (error) {
        console.error("Gagal memuat data statistik:", error);
      } finally {
        setLoading(false);
      }
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
    <div className="p-6 mt-12 bg-gray-100 min-h-screen">
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

      {/* 🔽 Tambahan: Daftar 5 Karyawan Tercepat */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          5 Karyawan Datang Paling Awal Hari Ini
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Nama</th>
                <th className="px-4 py-2 border">Waktu Datang</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Foto</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {topEarly.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{item.nama}</td>
                  <td className="px-4 py-2 border">{item.datetime}</td>
                  <td className="px-4 py-2 border capitalize">
                    {item.status_absen}
                  </td>
                  <td className="px-4 py-2 border">
                    <img
                      src={`https://monja-file.pptik.id/v1/view?path=presensi/${item.gambar}`}
                      alt={item.nama}
                      className="h-10 w-10 object-cover rounded-full mx-auto"
                    />
                  </td>
                </tr>
              ))}
              {topEarly.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Tidak ada data hadir hari ini.
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

export default DashboardPresensi;
