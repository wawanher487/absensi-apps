import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
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

const padZero = (n) => (n < 10 ? "0" + n : n);

const getTanggalRange = (rangeType) => {
  const end = new Date();
  const start = new Date();

  if (rangeType === "week") start.setDate(end.getDate() - 6);
  else if (rangeType === "month") start.setMonth(end.getMonth() - 1);
  else if (rangeType === "year") start.setFullYear(end.getFullYear() - 1);

  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dd = padZero(d.getDate());
    const mm = padZero(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    dates.push(`${dd}-${mm}-${yyyy}`);
  }
  return dates;
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
        const res = await localApi.get(
          `/history_ai/range?start=${start}&end=${end}`
        );

        const data = res.data.data || [];
        const grouped = {};

        data.forEach((item) => {
          const tanggal = item.datetime.split(" ")[0];
          if (!grouped[tanggal]) {
            grouped[tanggal] = {
              hadir: 0,
              telat: 0,
              jamMasuk: [],
              jamKeluar: [],
            };
          }
          if (item.status_absen === "hadir") grouped[tanggal].hadir += 1;
          grouped[tanggal].telat += item.jumlah_telat || 0;

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
            telat: data?.telat || 0,
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

  // const exportExcel = () => {
  //   const formattedData = chartData.map((item) => ({
  //     Tanggal: item.tanggal,
  //     Hadir: item.hadir,
  //     Terlambat: item.telat,
  //     "Rata-rata Jam Masuk": item.avgMasuk
  //       ? `${String(Math.floor(item.avgMasuk)).padStart(2, "0")}:${String(
  //           Math.round((item.avgMasuk % 1) * 60)
  //         ).padStart(2, "0")}`
  //       : "-",
  //     "Rata-rata Jam Keluar": item.avgKeluar
  //       ? `${String(Math.floor(item.avgKeluar)).padStart(2, "0")}:${String(
  //           Math.round((item.avgKeluar % 1) * 60)
  //         ).padStart(2, "0")}`
  //       : "-",
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(formattedData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kehadiran");
  //   XLSX.writeFile(workbook, "laporan_kehadiran.xlsx");
  // };

  const exportPDF = async () => {
    const pdf = new jsPDF("p", "pt", "a4");

    // Header: teks di tengah
    const pageWidth = pdf.internal.pageSize.getWidth();
    const title = "Laporan Kehadiran";
    pdf.setFontSize(16);
    const textWidth = pdf.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    pdf.text(title, x, 40);

    // Ambil elemen grafik
    const grafik1 = document.getElementById("grafik-1");
    const grafik2 = document.getElementById("grafik-2");

    // Render grafik ke canvas
    const canvas1 = await html2canvas(grafik1, {
      scale: 2,
      backgroundColor: "#fff",
    });
    const canvas2 = await html2canvas(grafik2, {
      scale: 2,
      backgroundColor: "#fff",
    });

    // Konversi ke gambar
    const img1 = canvas1.toDataURL("image/png");
    const img2 = canvas2.toDataURL("image/png");

    // Tambahkan gambar ke PDF
    pdf.addImage(img1, "PNG", 40, 60, 500, 200);
    pdf.addImage(img2, "PNG", 40, 280, 500, 200);

    // Tambahkan tanggal ke nama file
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const fileName = `laporan_kehadiran_${dd}-${mm}-${yyyy}.pdf`;

    pdf.save(fileName);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Laporan</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Periode:</label>
          <select
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="week">1 Minggu</option>
            <option value="month">1 Bulan</option>
            <option value="year">1 Tahun</option>
          </select>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Export Excel
          </button> */}
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div id="grafik-1" className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Status Kehadiran</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis dataKey="tanggal" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hadir" fill="#4CAF50" name="Hadir" />
            <Bar dataKey="telat" fill="#F44336" name="Terlambat" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div id="grafik-2" className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Rata-rata Jam Masuk & Pulang (Format: Jam:Menit)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="tanggal" />
            <YAxis
              domain={[6, 20]}
              tickFormatter={(value) => {
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                return `${String(hours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`;
              }}
            />
            <Tooltip
              formatter={(value) => {
                if (typeof value === "number") {
                  const hours = Math.floor(value);
                  const minutes = Math.round((value - hours) * 60);
                  return `${String(hours).padStart(2, "0")}:${String(
                    minutes
                  ).padStart(2, "0")}`;
                }
                return value;
              }}
            />
            <Legend />
            <Bar
              dataKey="avgMasuk"
              fill="#2196F3"
              name="Jam Masuk (Rata-rata)"
            />
            <Bar
              dataKey="avgKeluar"
              fill="#FF9800"
              name="Jam Keluar (Rata-rata)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
