import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { User } from '../model/pages/authentication.model';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FileExport {
  exportUnitsByUser(units: any, users: any) {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // Group by nama_pemilik (case-insensitive)
    const grouped: { [ownerKey: string]: { displayName: string; records: any[] } } = {};

    Object.entries(units).forEach(([id, unit]: any) => {
      const ownerRaw = unit.nama_pemilik || 'Tanpa Nama';
      const ownerKey = ownerRaw.toLowerCase();

      if (!grouped[ownerKey]) {
        grouped[ownerKey] = { displayName: ownerRaw, records: [] };
      }
      grouped[ownerKey].records.push({ id, ...unit });
    });

    // Buat sheet per nama_pemilik
    Object.values(grouped).forEach(({ displayName, records }) => {
      const sheetName = displayName.substring(0, 31); // Excel max 31 char

      const cleaned = records.map((rec: any) => ({
        Pemilik: rec.nama_pemilik,
        Plat: rec.plat_nomor,
        Jenis: rec.jenis_mobil,
        Merk: rec.merk_mobil,
        Waktu: rec.waktu_entry
          ? formatDate(new Date(rec.waktu_entry), 'dd-MM-yyyy HH:mm:ss', 'EN')
          : ''
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(cleaned);
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    });

    // Export file
    XLSX.writeFile(
      workbook,
      `Pandora App Unit Export ${formatDate(new Date(), 'dd-MM-yyyy HH.mm.ss', 'EN')}.xlsx`
    );
  }
}
