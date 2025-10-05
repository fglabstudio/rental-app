import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { UnitEntry } from '../../model/pages/unit.model';
import { UnitService } from '../../services/unit';
import { Layout } from "../../components/layout/layout";
import { LoginService } from '../../services/login';

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
  private loginService = inject(LoginService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  entries = signal<UnitEntry[]>([]);
  selectedEntry = signal<UnitEntry | null>(null);
  mode = signal<'list' | 'detail' | 'add'>('list');

  // tambahan state untuk file upload
  stnkFile: File | null = null;
  stnkPreview: string | null = null;

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
    user_entry: ['']
  });

  constructor() {
    this.loadEntries();
  }

  loadEntries(force = false) {
    this.unitService.getAll(force).subscribe((data) => {
      this.entries.set(data);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.stnkFile = null;
      this.stnkPreview = null;
      return;
    }
    this.stnkFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.stnkPreview = reader.result as string);
    reader.readAsDataURL(this.stnkFile);
  }

  showAdd() {
    this.form.reset({ status_active: true, waktu_entry: new Date().toISOString() });
    this.stnkFile = null;
    this.stnkPreview = null;
    this.mode.set('add');
  }

  showDetail(entry: UnitEntry) {
    this.selectedEntry.set(entry);
    this.form.patchValue(entry);
    this.stnkFile = null;
    this.stnkPreview = entry.keterangan || null; // kalau URL disimpan di keterangan
    this.mode.set('detail');
  }

  saveNew() {
    if (this.form.valid && this.stnkFile) {
      this.form.get('user_entry')?.setValue(this.loginService.getProfile().id!);

      this.unitService.add(this.form.value as UnitEntry, this.stnkFile ?? undefined).subscribe(() => {
        this.loadEntries(true);
        this.mode.set('list');
        this.resetFile();
      });
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: 'error', summary: 'Oops', detail: 'Periksa kembali data unit' })
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
          this.unitService.update(entry.id!, this.form.value as UnitEntry, this.stnkFile ?? undefined, entry.stnk_path)
            .subscribe(() => {
              this.loadEntries(true);
              this.mode.set('list');
              this.resetFile();
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
          const oldFilePath = entry.keterangan
            ? entry.keterangan.split('/object/public/unit-files/')[1]
            : undefined;

          this.unitService.delete(entry.id!, entry.stnk_path).subscribe(() => {
            this.loadEntries(true);
            this.mode.set('list');
          });
        },
      });
    }
  }

  back() {
    this.mode.set('list');
    this.selectedEntry.set(null);
    this.resetFile();
  }

  private resetFile() {
    this.stnkFile = null;
    this.stnkPreview = null;
  }
}
