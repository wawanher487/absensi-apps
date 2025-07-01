import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import Pagination from "../../components/pagination";
import axios from "axios";

export default function DataAI() {
  const [dataAI, setDataAI] = useState([]);
  const [filterNama, setFilterNama] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

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

      if (res.data && Array.isArray(res.data.data)) {
        setDataAI(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setDataAI([]);
        setErrorMessage("Data tidak valid.");
      }
    } catch (err) {
      setDataAI([]);
      if (axios.isAxiosError(err) && err.response) {
        setErrorMessage(err.response.data.message || "Gagal mengambil data.");
      } else {
        setErrorMessage("Terjadi kesalahan jaringan.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filterNama, filterTanggal]);

  const handleNamaChange = (e) => {
    setFilterNama(e.target.value);
    setCurrentPage(1);
  };

  const handleTanggalChange = (date) => {
    setFilterTanggal(date);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilterNama("");
    setFilterTanggal(null);
    setCurrentPage(1);
    fetchData();
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data AI</h1>

      {/* Filter*/}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Cari Nama..."
          value={filterNama}
          onChange={handleNamaChange}
          className="border px-3 py-2 rounded w-60"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiCalendar />
          </span>
          <DatePicker
            selected={filterTanggal}
            onChange={handleTanggalChange}
            dateFormat="dd-MM-yyyy"
            placeholderText="Pilih tanggal"
            className="pl-10 pr-4 py-2 border rounded w-60"
          />
        </div>
        <button
          onClick={handleReset}
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10">🔄 Memuat data...</div>
      ) : errorMessage ? (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded">
          {errorMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {dataAI.map((item, index) => (
            <Link to={`${item.id}`} key={item.id || index}>
              <div className="bg-white p-4 rounded shadow border text-center hover:shadow-lg transition">
                <img
                  src={`https://monja-file.pptik.id/v1/view?path=presensi/${item.gambar}`}
                  alt={`Gambar ${item.nama}`}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p className="font-semibold">{item.nama}</p>
                <p className="text-sm">Tanggal: {item.datetime}</p>
                <p className="text-sm">Masuk: {item.jam_masuk_actual}</p>
                <p className="text-sm">Kehadiran: {item.status_absen}</p>
                <p className="text-sm">pulang: {item.jam_keluar_actual}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!errorMessage && dataAI.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-4">
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
