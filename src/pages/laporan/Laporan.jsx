import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.tz.setDefault("Asia/Jakarta");

const getTanggalRange = (rangeType) => {
  const end = dayjs().tz();
  let start = end;

  if (rangeType === "week") start = end.subtract(6, "day");
  else if (rangeType === "month") start = end.subtract(1, "month");
  else if (rangeType === "year") start = end.subtract(1, "year");

  const dates = [];
  let current = start;
  while (current.isSameOrBefore(end, "day")) {
    dates.push(current.format("DD-MM-YYYY"));
    current = current.add(1, "day");
  }

  return dates;
};

// Komponen baru untuk item detail yang bisa dilipat (Accordion)
const DetailItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Jangan tampilkan apapun jika tidak ada data sama sekali pada hari itu
  if (item.hadirList.length === 0 && item.terlambatList.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-md">
      {/* Tombol Header Akordeon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-gray-800">{item.tanggal}</span>
          {/* Badge Ringkasan */}
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {item.hadirList.length} Hadir
          </span>
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {item.terlambatList.length} Terlambat
          </span>
        </div>
        {/* Ikon Panah Buka/Tutup */}
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Konten Detail (yang bisa dilipat) */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {item.hadirList.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-gray-700 mb-2">✅ Daftar Hadir:</p>
              <div className="flex flex-wrap gap-2">
                {item.hadirList.map((nama) => (
                  <span
                    key={nama}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded-full"
                  >
                    {nama}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.terlambatList.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">⏰ Daftar Terlambat:</p>
              <div className="flex flex-wrap gap-2">
                {item.terlambatList.map((nama) => (
                  <span
                    key={nama}
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded-full"
                  >
                    {nama}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Laporan() {
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState("week");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      const tanggalList = getTanggalRange(chartRange);
      const start = tanggalList[0];
      const end = tanggalList[tanggalList.length - 1];

      try {
        const res = await localApi.get(`/history_ai/range?start=${start}&end=${end}`);
        const data = res.data.data || [];
        const grouped = {};

        data.forEach((item) => {
          const tanggal = dayjs(item.datetime).tz().format("DD-MM-YYYY");

          if (!grouped[tanggal]) {
            grouped[tanggal] = {
              hadir: 0,
              terlambat: 0,
              jamMasuk: [],
              jamKeluar: [],
              hadirList: [],
              terlambatList: [],
            };
          }

          const statusArray = Array.isArray(item.status_absen)
            ? item.status_absen
            : [item.status_absen];

          if (statusArray.includes("Hadir")) {
            grouped[tanggal].hadir += 1;
            if (!grouped[tanggal].hadirList.includes(item.nama)) {
              grouped[tanggal].hadirList.push(item.nama);
            }
          }

          if (statusArray.includes("Terlambat")) {
            grouped[tanggal].terlambat += 1;
            if (!grouped[tanggal].terlambatList.includes(item.nama)) {
              grouped[tanggal].terlambatList.push(item.nama);
            }
          }

          if (item.jam_masuk_actual) {
            const [h, m] = item.jam_masuk_actual.split(":").map(Number);
            grouped[tanggal].jamMasuk.push(h + m / 60);
          }
          if (item.jam_keluar_actual) {
            const [h, m] = item.jam_keluar_actual.split(":").map(Number);
            grouped[tanggal].jamKeluar.push(h + m / 60);
          }
        });

        const result = tanggalList.map((tgl) => {
          const data = grouped[tgl];
          return {
            tanggal: tgl,
            hadir: data?.hadir || 0,
            terlambat: data?.terlambat || 0,
            avgMasuk: data?.jamMasuk.length
              ? (data.jamMasuk.reduce((a, b) => a + b, 0) / data.jamMasuk.length).toFixed(2)
              : null,
            avgKeluar: data?.jamKeluar.length
              ? (data.jamKeluar.reduce((a, b) => a + b, 0) / data.jamKeluar.length).toFixed(2)
              : null,
            hadirList: data?.hadirList || [],
            terlambatList: data?.terlambatList || [],
          };
        });

        setChartData(result);
      } catch (err) {
        console.error("Gagal ambil data grafik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [chartRange]);

  const exportPDF = async () => {
    // Fungsi export PDF tidak diubah
    const pdf = new jsPDF("p", "pt", "a4");
    const title = "Laporan Kehadiran";
    const pageWidth = pdf.internal.pageSize.getWidth();
    const x = (pageWidth - pdf.getTextWidth(title)) / 2;
    pdf.setFontSize(16);
    pdf.text(title, x, 40);

    const grafik1 = document.getElementById("grafik-1");
    const grafik2 = document.getElementById("grafik-2");

    const canvas1 = await html2canvas(grafik1, { scale: 2 });
    const canvas2 = await html2canvas(grafik2, { scale: 2 });

    const img1 = canvas1.toDataURL("image/png");
    const img2 = canvas2.toDataURL("image/png");

    pdf.addImage(img1, "PNG", 40, 60, 500, 200);
    pdf.addImage(img2, "PNG", 40, 280, 500, 200);

    pdf.save(`laporan_kehadiran.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Laporan Kehadiran</h1>

      <div className="flex items-center gap-4 mb-4">
        <label>Periode:</label>
        <select
          value={chartRange}
          onChange={(e) => setChartRange(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="week">1 Minggu</option>
          <option value="month">1 Bulan</option>
          <option value="year">1 Tahun</option>
        </select>

        <button
          onClick={exportPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      <div id="grafik-1" className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Grafik Kehadiran</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="tanggal" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hadir" fill="#4CAF50" name="Hadir" />
            <Bar dataKey="terlambat" fill="#F44336" name="Terlambat" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div id="grafik-2" className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Rata-rata Jam Masuk & Pulang
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="tanggal" />
            <YAxis
              domain={[6, 20]}
              tickFormatter={(v) => {
                const h = Math.floor(v);
                const m = Math.round((v - h) * 60);
                return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgMasuk" fill="#2196F3" name="Jam Masuk (Avg)" />
            <Bar dataKey="avgKeluar" fill="#FF9800" name="Jam Pulang (Avg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* BAGIAN YANG DIPERBARUI */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">
          Detail Kehadiran per Hari
        </h2>
        <div className="space-y-2">
          {chartData.length > 0 ? (
            chartData.map((item) => <DetailItem key={item.tanggal} item={item} />)
          ) : (
            <p className="text-gray-500 text-center py-4">
              {loading ? "Memuat data..." : "Tidak ada data untuk ditampilkan."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}