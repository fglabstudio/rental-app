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

    // Group by user_entry
    const grouped: { [key: string]: any[] } = {};
    Object.entries(units).forEach(([id, unit]: any) => {
      const userId = unit.user_entry;
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push({ id, ...unit });
    });

    // Buat sheet per user
    Object.entries(grouped).forEach(([userId, records]) => {
      const user = users.find((data: User) => data.id == userId);
      const sheetName = (user?.full_name || `User_${userId}`).substring(0, 31);

      // Bersihkan data → pilih field yang mau diexport
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
    XLSX.writeFile(workbook, `Pandora App Unit Export ${formatDate(new Date(), "dd-MM-yyyy HH.mm.ss", 'EN')}.xlsx`);
  }
}
