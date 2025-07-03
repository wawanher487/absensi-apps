import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

export const formatTanggalWaktu = (isoString: string): string => {
  return dayjs(isoString).format("dddd, DD MMMM YYYY [pukul] HH:mm:ss");
};

export const formatTanggalSaja = (isoString: string): string => {
  return dayjs(isoString).format("dddd, DD MMMM YYYY");
};

export const toDatetimeLocal = (isoString: string) => {
  if (!isoString) return "";
  const dt = new Date(isoString);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
};

export const formatTanggalPendek = (isoString: string): string => {
  return dayjs(isoString).tz("Asia/Jakarta").format("DD MMMM YYYY");
};
