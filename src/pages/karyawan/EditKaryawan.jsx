import { useEffect, useState } from "react";
import { localApi } from "../../api/axiosInstance";

const EditKaryawan = ({ karyawan, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    phoneNumber: "",
    address: "",
    jabatan: "",
    unit: "",
    birthDate: "",
    gender: "",
    gajiHarian: 0,
    status: true,
  });

  useEffect(() => {
    if (karyawan) {
      setFormData({
        nama: karyawan.nama || "",
        nip: karyawan.nip || "",
        phoneNumber: karyawan.phoneNumber || "",
        address: karyawan.address || "",
        jabatan: karyawan.jabatan || "",
        unit: karyawan.unit || "",
        birthDate: karyawan.birthDate || "",
        gender: karyawan.gender || "",
        gajiHarian: karyawan.gajiHarian || 0,
        status: karyawan.status ?? true,
      });
    }
  }, [karyawan]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (["phoneNumber", "nip"].includes(name)) {
      const onlyNumbers = value.replace(/\D/g, ""); // Hapus non-angka
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
      return;
    }

    if (name === "birthDate") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 8); // Max 8 angka
      let formatted = onlyNumbers;

      if (onlyNumbers.length >= 5) {
        formatted = `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(
          2,
          4
        )}-${onlyNumbers.slice(4)}`;
      } else if (onlyNumbers.length >= 3) {
        formatted = `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(2)}`;
      }

      setFormData((prev) => ({ ...prev, birthDate: formatted }));
      return;
    }

    if (name === "status") {
      setFormData((prev) => ({ ...prev, status: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGajiChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      gajiHarian: Number(rawValue),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.birthDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
      alert("Format tanggal lahir harus DD-MM-YYYY");
      return;
    }

    const payload = {
      ...formData,
      gajiHarian: Number(formData.gajiHarian),
    };

    try {
      await localApi.patch(`/karyawan/update/${karyawan.id}`, payload);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Gagal update karyawan:", error);
      if (error.response) {
        alert("Gagal update:\n" + JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Terjadi kesalahan saat mengirim data.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">
          Edit Karyawan
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">NIP</label>
            <input
              type="text"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Nomor Telepon</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Tanggal Lahir</label>
            <input
              type="text"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              placeholder="DD-MM-YYYY"
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Jabatan</label>
            <input
              type="text"
              name="jabatan"
              value={formData.jabatan}
              onChange={handleChange}
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Gaji Harian</label>
            <input
              type="text"
              name="gajiHarian"
              value={new Intl.NumberFormat("id-ID").format(formData.gajiHarian)}
              onChange={handleGajiChange}
              placeholder="Contoh: 100000"
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Status Aktif</label>
            <select
              name="status"
              value={formData.status ? "true" : "false"}
              onChange={handleChange}
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>

          <div className="col-span-2 flex flex-col">
            <label className="mb-1 font-medium">Alamat</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 font-medium">Jenis Kelamin</label>
            <div className="flex gap-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="L"
                  checked={formData.gender === "L"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Laki-laki
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="P"
                  checked={formData.gender === "P"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Perempuan
              </label>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-black-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Konfirmasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKaryawan;
