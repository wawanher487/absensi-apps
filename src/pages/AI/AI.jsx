import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import Pagination from "../../components/pagination";

export default function DataAI() {
  const [dataAI, setDataAI] = useState([]);
  const [filterNama, setFilterNama] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tanggalQuery = filterTanggal
        ? filterTanggal.toLocaleDateString("id-ID").split("/").join("-")
        : "";

      const res = await localApi.get("/history_ai/get", {
        params: {
          page: currentPage,
          nama: filterNama,
          tanggal: tanggalQuery,
        },
      });

      if (res.data && res.data.data) {
        setDataAI(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Gagal mengambil data AI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filterNama, filterTanggal]);

  const handleNamaChange = (e) => {
    setFilterNama(e.target.value);
    setCurrentPage(1); // reset ke halaman 1 saat filter berubah
  };

  const handleTanggalChange = (date) => {
    setFilterTanggal(date);
    setCurrentPage(1); // reset ke halaman 1 saat filter berubah
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data AI</h1>

      {/* Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Cari nama..."
          value={filterNama}
          onChange={handleNamaChange}
          className="px-4 py-2 border rounded w-full md:w-1/3"
        />
        <div className="w-full md:w-1/3 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiCalendar />
          </span>
          <DatePicker
            selected={filterTanggal}
            onChange={handleTanggalChange}
            dateFormat="dd-MM-yyyy"
            placeholderText="Pilih tanggal"
            className="w-full pl-10 pr-4 py-2 border rounded"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : dataAI.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada data ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {dataAI.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow border text-center hover:shadow-lg transition"
            >
              <img
                src={`https://monja-file.pptik.id/v1/view?path=presensi/${item.gambar}`}
                alt={`Gambar ${item.nama}`}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <p className="font-semibold">{item.nama}</p>
              <p className="text-sm">Tanggal: {item.datetime}</p>
              <p className="text-sm">Kehadiran: {item.status_absen}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
