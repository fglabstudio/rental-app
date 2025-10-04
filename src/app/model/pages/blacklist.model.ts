export interface BlacklistEntry {
    id?: string;
    nama_lengkap: string;
    alamat: string;
    kabupaten_kota: string;
    kronologi: string;
    no_identitas: string;
    status_active: boolean;
    waktu_entry: string;
    waktu_deactivated?: string;
}