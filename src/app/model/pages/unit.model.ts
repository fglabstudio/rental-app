export interface UnitEntry {
    id?: string;
    nama_pemilik: string;
    plat_nomor: string;
    jenis_mobil: string;
    merk_mobil: string;
    keterangan?: string;
    status_active: boolean;
    waktu_entry: string;
    user_entry: string;
}