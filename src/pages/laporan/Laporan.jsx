// Laporan.jsx
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
dayjs.extend(isSameOrBefore); // << tambahkan ini
dayjs().tz("Asia/Jakarta");

const padZero = (n) => (n < 10 ? "0" + n : n);

const getTanggalRange = (rangeType) => {
  const end = dayjs().tz("Asia/Jakarta");
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

console.log("Tanggal Range:", getTanggalRange("week"));

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
        const res = await localApi.get(
          `/history_ai/range?start=${start}&end=${end}`
        );
        const data = res.data.data || [];
        const grouped = {};

        data.forEach((item) => {
          const tanggal = dayjs(item.datetime)
            .tz("Asia/Jakarta")
            .format("DD-MM-YYYY");

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

          if (item.status_absen === "hadir") {
            grouped[tanggal].hadir += 1;
            grouped[tanggal].hadirList.push(item.nama);
          } else if (item.status_absen === "terlambat") {
            grouped[tanggal].terlambat += 1;
            grouped[tanggal].terlambatList.push(item.nama);
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
            avgMasuk: data?.jamMasuk?.length
              ? (
                  data.jamMasuk.reduce((a, b) => a + b, 0) /
                  data.jamMasuk.length
                ).toFixed(2)
              : null,
            avgKeluar: data?.jamKeluar?.length
              ? (
                  data.jamKeluar.reduce((a, b) => a + b, 0) /
                  data.jamKeluar.length
                ).toFixed(2)
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
                return `${String(h).padStart(2, "0")}:${String(m).padStart(
                  2,
                  "0"
                )}`;
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgMasuk" fill="#2196F3" name="Jam Masuk (Avg)" />
            <Bar dataKey="avgKeluar" fill="#FF9800" name="Jam Pulang (Avg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Detail Siapa yang Hadir & Terlambat
        </h2>
        {chartData.map((item) => (
          <div key={item.tanggal} className="mb-4 border-b pb-2">
            <p className="font-semibold">{item.tanggal}</p>
            <p>
              ✅ Hadir:{" "}
              {(item.hadirList?.length || 0) > 0
                ? item.hadirList.join(", ")
                : "-"}
            </p>
            <p>
              ⏰ Terlambat:{" "}
              {(item.terlambatList?.length || 0) > 0
                ? item.terlambatList.join(", ")
                : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
