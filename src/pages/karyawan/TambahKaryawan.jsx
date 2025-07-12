import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { localApi } from "../../api/axiosInstance";
import { toast } from "react-toastify";
import dayjs from "dayjs"; // Tambahkan ini untuk format tanggal

// --- SVG Icons ---
const UploadCloudIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const RefreshCwIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const TambahKaryawan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    phoneNumber: "",
    birthDate: "",
    address: "",
    jabatan: "",
    unit: "",
    gender: "L",
    gajiHarian: "",
    status: true,
    file: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const generateNIP = () => {
    const uniqueNip = Math.floor(100000000000 + Math.random() * 900000000000);
    setFormData((prev) => ({ ...prev, nip: uniqueNip.toString() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setFormData((prev) => ({ ...prev, status: value === "true" }));
    } else if (["nip", "phoneNumber", "gajiHarian"].includes(name)) {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      for (const key in formData) {
        if (formData[key] !== null) {
          if (key === "gajiHarian") {
            console.log(typeof formData.gajiHarian, formData.gajiHarian);
            data.append(key, Number(formData[key])); // konversi ke number
          } else if (key === "birthDate") {
            data.append("birthDate", formData.birthDate);
          } else {
            data.append(key, formData[key]);
          }
        }
      }
      console.log(typeof formData.gajiHarian, formData.gajiHarian);

      await localApi.post("/karyawan/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Berhasil menambahkan karyawan");
      alert("Karyawan berhasil ditambahkan");
      navigate("/app/karyawan");
    } catch (error) {
      console.error("Gagal tambah karyawan:", error);
      const messages = error?.response?.data?.message;
      if (Array.isArray(messages)) {
        messages.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Gagal menambahkan karyawan");
      }
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-50/50 w-full min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Tambah Karyawan Baru
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Isi detail di bawah ini untuk mendaftarkan karyawan baru.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/app/karyawan")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Simpan Karyawan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- Column 1 & 2: Form Fields --- */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">
                    Informasi Pribadi
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Nama */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                    {/* NIP */}
                    <div>
                      <label className="font-medium text-gray-700">NIP</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="nip"
                          value={formData.nip}
                          onChange={handleChange}
                          required
                          className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Generate atau isi manual"
                        />
                        <button
                          type="button"
                          onClick={generateNIP}
                          title="Generate NIP Otomatis"
                          className="p-2.5 bg-blue-100 text-blue-700 rounded-lg mt-2 hover:bg-blue-200 transition-all"
                        >
                          <RefreshCwIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {/* Nomor Telepon */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: 081234567890"
                      />
                    </div>
                    {/* Tanggal Lahir */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-500"
                      />
                    </div>
                    {/* Alamat */}
                    <div className="md:col-span-2">
                      <label className="font-medium text-gray-700">
                        Alamat
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan alamat lengkap karyawan"
                      ></textarea>
                    </div>
                    {/* Jenis Kelamin */}
                    <div className="md:col-span-2">
                      <label className="font-medium text-gray-700 mb-2 block">
                        Jenis Kelamin
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 has-[:checked]:ring-1 has-[:checked]:ring-blue-400 transition-all">
                          <input
                            type="radio"
                            name="gender"
                            value="L"
                            checked={formData.gender === "L"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-800">Laki-laki</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 has-[:checked]:ring-1 has-[:checked]:ring-blue-400 transition-all">
                          <input
                            type="radio"
                            name="gender"
                            value="P"
                            checked={formData.gender === "P"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-800">Perempuan</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Information Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">
                    Informasi Pekerjaan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Unit */}
                    <div>
                      <label className="font-medium text-gray-700">Unit</label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: Backend"
                      />
                    </div>
                    {/* Jabatan */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: Pegawai junior"
                      />
                    </div>
                    {/* Gaji Harian */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Gaji Harian (Rp)
                      </label>
                      <input
                        type="text"
                        name="gajiHarian"
                        value={formData.gajiHarian}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: 150000"
                      />
                      {formData.gajiHarian && (
                        <p className="text-xs text-gray-500 mt-1">
                          Terformat: {formatCurrency(formData.gajiHarian)}
                        </p>
                      )}
                    </div>
                    {/* Status */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status ? "true" : "false"}
                        onChange={handleChange}
                        className="w-full border-gray-300 bg-gray-50 px-4 py-2.5 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Column 3: Image Upload --- */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Foto Profil Karyawan
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Pastikan foto wajah jelas, tanpa masker atau kacamata.
                </p>
                <div className="mt-2">
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center relative overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500">
                        <UploadCloudIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2">Seret & lepas gambar di sini</p>
                        <p className="text-xs text-gray-400 mt-1">atau</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      title={imagePreview ? "Ganti foto" : "Pilih foto"}
                    />
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, file: null }));
                      }}
                      className="w-full mt-4 px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahKaryawan;
