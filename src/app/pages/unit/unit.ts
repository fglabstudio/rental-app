import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { UnitEntry } from '../../model/pages/unit.model';
import { UnitService } from '../../services/unit';
import { Layout } from "../../components/layout/layout";

@Component({
  selector: 'app-unit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    Layout
  ],
  providers: [ConfirmationService],
  templateUrl: './unit.html',
  styleUrl: './unit.scss',
  standalone: true,
})
export class Unit {
  private fb = inject(FormBuilder);
  private unitService = inject(UnitService);
  private confirmationService = inject(ConfirmationService);

  entries = signal<UnitEntry[]>([]);
  selectedEntry = signal<UnitEntry | null>(null);
  mode = signal<'list' | 'detail' | 'add'>('list');

  searchTerm = signal<string>('');
  filteredEntries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.entries();
    return this.entries().filter(
      (e) =>
        e.nama_pemilik.toLowerCase().includes(term) || e.plat_nomor.toLowerCase().includes(term)
    );
  });

  form = this.fb.group({
    nama_pemilik: ['', Validators.required],
    plat_nomor: ['', Validators.required],
    jenis_mobil: ['', Validators.required],
    merk_mobil: ['', Validators.required],
    keterangan: [''],
    status_active: [true],
    waktu_entry: [''],
  });

  constructor() {
    this.loadEntries();
  }

  loadEntries() {
    this.unitService.getAll().subscribe((data) => {
      this.entries.set(data);
    });
  }

  showAdd() {
    this.form.reset({ status_active: true, waktu_entry: new Date().toISOString() });
    this.mode.set('add');
  }

  showDetail(entry: UnitEntry) {
    this.selectedEntry.set(entry);
    this.form.patchValue(entry);
    this.mode.set('detail');
  }

  saveNew() {
    if (this.form.valid) {
      this.unitService.add(this.form.value as UnitEntry).subscribe(() => {
        this.loadEntries();
        this.mode.set('list');
      });
    }
  }

  confirmUpdate() {
    const entry = this.selectedEntry();
    if (entry && this.form.valid) {
      this.confirmationService.confirm({
        message: 'Yakin ingin memperbarui data unit ini?',
        header: 'Konfirmasi Update',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.unitService.update(entry.id!, this.form.value as UnitEntry).subscribe(() => {
            this.loadEntries();
            this.mode.set('list');
          });
        },
      });
    }
  }

  confirmDelete() {
    const entry = this.selectedEntry();
    if (entry) {
      this.confirmationService.confirm({
        message: 'Yakin ingin menghapus unit ini?',
        header: 'Konfirmasi Hapus',
        icon: 'pi pi-trash',
        acceptLabel: 'Ya, Hapus',
        rejectLabel: 'Batal',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-sm',
        accept: () => {
          this.unitService.delete(entry.id!).subscribe(() => {
            this.loadEntries();
            this.mode.set('list');
          });
        },
      });
    }
  }

  back() {
    this.mode.set('list');
    this.selectedEntry.set(null);
  }
}
