import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import Pagination from "../../components/pagination";
import { localApi } from "../../api/axiosInstance";

export default function KameraPage() {
  const [dataKamera, setDataKamera] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await localApi.get(`/history/get?page=${currentPage}`);
        if (Array.isArray(res.data?.data)) {
          setDataKamera(res.data.data);
          setTotalPages(res.data.totalPages || 1);
        } else {
          console.error("Data bukan array:", res.data);
          setDataKamera([]);
        }
      } catch (err) {
        console.error("Gagal fetch kamera:", err);
        setDataKamera([]);
      }
    };
    fetchData();
  }, [currentPage]);

  const currentItems = dataKamera;

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data Kamera</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
        {currentItems.map((kamera, index) => (
          <Link to={`${kamera.id}`} key={kamera.id || index}>
            <div className="bg-white p-4 rounded shadow border text-center hover:shadow-lg transition cursor-pointer">
              {kamera.gambar ? (
                <img
                  src={`https://monja-file.pptik.id/v1/view?path=presensi/${kamera.gambar}`}
                  alt={`Gambar ${kamera.guid}`}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-40 bg-gray-200 rounded mb-2 text-gray-500 text-4xl">
                  <FaUser />
                </div>
              )}
              <p className="font-semibold">GUID: {kamera.guid_device}</p>
              <p className="text-sm text-gray-600">
                Tanggal: {kamera.datetime}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
