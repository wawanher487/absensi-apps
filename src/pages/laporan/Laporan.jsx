import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Laporan() {
  const [laporan, setLaporan] = useState([]);
  const [filterNama, setFilterNama] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const res = await localApi.get("/laporan/get");
        setLaporan(res.data);
      } catch (err) {
        console.error("Gagal ambil data laporan:", err);
      }
    };
    fetchLaporan();
  }, []);

  const filteredLaporan = laporan.filter((item) => {
    const matchNama = item.nama
      .toLowerCase()
      .includes(filterNama.toLowerCase());
    const matchTanggal =
      startDate && endDate
        ? new Date(item.latestAttendanceDate) >= startDate &&
          new Date(item.latestAttendanceDate) <= endDate
        : true;
    return matchNama && matchTanggal;
  });

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLaporan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kehadiran");
    XLSX.writeFile(workbook, "laporan_kehadiran.xlsx");
  };

  const exportPDF = () => {
    const input = document.getElementById("laporan-table");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("laporan_kehadiran.pdf");
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Laporan Kehadiran AI</h1>

      {/* Filter dan Export */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari nama..."
          value={filterNama}
          onChange={(e) => setFilterNama(e.target.value)}
          className="px-4 py-2 border rounded w-full md:w-1/4"
        />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Tanggal mulai"
          className="px-4 py-2 border rounded w-full md:w-1/4"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="Tanggal akhir"
          className="px-4 py-2 border rounded w-full md:w-1/4"
        />
        <button
          onClick={exportExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Export PDF
        </button>
      </div>

      {/* Tabel Laporan */}
      <div className="overflow-x-auto">
        <table
          id="laporan-table"
          className="min-w-full table-auto bg-white shadow rounded overflow-hidden"
        >
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Jumlah Kehadiran</th>
              <th className="px-4 py-2 text-left">Jumlah Keterlambatan</th>
              <th className="px-4 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredLaporan.map((item) => (
              <tr key={item.userGuid} className="border-t">
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2">{item.totalHadir}</td>
                <td className="px-4 py-2">{item.totalTerlambat}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() =>
                      (window.location.href = `/laporan/${item.userGuid}`)
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
