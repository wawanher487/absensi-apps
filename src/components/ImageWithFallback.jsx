import { useState } from "react";
import { FaUser } from "react-icons/fa";

const ftpBase =
  import.meta.env.VITE_FTP_BASE ||
  "https://monja-file.pptik.id/v1/view?path=presensi/";
const localBase = `${import.meta.env.VITE_AI_URL}/static/detections/`;

export default function ImageWithFallback({
  filename,
  alt = "",
  className = "",
}) {
  const [step, setStep] = useState(0); // 0=FTP, 1=AI, 2=placeholder

  // tentukan src berdasarkan step
  let src = "";
  if (step === 0) src = ftpBase + filename;
  else if (step === 1) src = localBase + filename;

  // jika sudah di step 2, render ikon
  if (step === 2) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <FaUser className="text-gray-500 text-4xl" />
      </div>
    );
  }

  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      className={className}
      onError={() => setStep(step + 1)} // setiap gagal, naikkan step
    />
  );
}
