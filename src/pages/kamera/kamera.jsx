import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import Pagination from "../../components/pagination";
import { localApi } from "../../api/axiosInstance";
import ImageWithFallback from "../../components/ImageWithFallback";

export default function KameraPage() {
  const [dataKamera, setDataKamera] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tanggal, setTanggal] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage);

        if (tanggal) {
          const dateObj = new Date(tanggal);
          const dd = String(dateObj.getDate()).padStart(2, "0");
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const yyyy = dateObj.getFullYear();
          params.append("tanggal", `${dd}-${mm}-${yyyy}`);
        }

        const res = await localApi.get(`/history/get?${params.toString()}`);
        if (Array.isArray(res.data?.data)) {
          setDataKamera(res.data.data);
          setTotalPages(res.data.totalPages || 1);
          setErrorMessage("");
        } else {
          setDataKamera([]);
          setErrorMessage("Data tidak ditemukan.");
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Gagal memuat data kamera.";
        setDataKamera([]);
        setErrorMessage(msg);
      }
    };
    fetchData();
  }, [currentPage, tanggal]);

  const currentItems = dataKamera;

  const handleReset = () => {
    setTanggal("");
    setCurrentPage(1);
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data Kamera</h1>

      {/* 🔍 Fitur Pencarian Tanggal */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Cari Berdasarkan Tanggal:
        </label>
        <input
          type="date"
          className="px-4 py-2 border rounded-md w-full sm:w-64 shadow-sm"
          value={tanggal}
          onChange={(e) => {
            setTanggal(e.target.value);
            setCurrentPage(1); // Reset ke halaman 1 saat tanggal berubah
          }}
        />

        <button
          onClick={handleReset}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Reset
        </button>
      </div>

      {/* ❌ Pesan Error Jika Tidak Ada Data */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* ✅ Grid Data Kamera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
        {currentItems.map((kamera, index) => (
          <Link to={`${kamera.id}`} key={kamera.id || index}>
            <div className="bg-white p-4 rounded shadow border text-center hover:shadow-lg transition cursor-pointer">
              {kamera.gambar ? (
                <ImageWithFallback
                  filename={kamera.gambar}
                  alt={`Gambar ${kamera.guid_device}`}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-40 bg-gray-200 rounded mb-2 text-gray-500 text-4xl">
                  <FaUser />
                </div>
              )}
              <p className="font-semibold">GUID: {kamera.guid_device}</p>
              <p className="text-sm text-gray-600">
                Tanggal: {formatTanggalPendek(kamera.datetime)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* 📄 Pagination */}
      {!errorMessage && dataKamera.length > 0 && totalPages > 1 && (
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

export function formatTanggalPendek(datetimeStr) {
  // Contoh: "10-07-2025 13:07:19"
  const [tanggal, waktu] = datetimeStr.split(" ");
  const [dd, mm, yyyy] = tanggal.split("-");

  return `${dd}-${mm}-${yyyy}`;
}
