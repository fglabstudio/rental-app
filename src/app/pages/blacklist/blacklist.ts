import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { BlacklistEntry } from '../../model/pages/blacklist.model';
import { BlacklistService } from '../../services/blacklist';
import { Layout } from '../../components/layout/layout';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-blacklist',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    Layout,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './blacklist.html',
  styleUrl: './blacklist.scss',
  standalone: true,
})
export class Blacklist {
  private fb = inject(FormBuilder);
  private blacklistService = inject(BlacklistService);
  private confirmationService = inject(ConfirmationService);

  entries = signal<BlacklistEntry[]>([]);
  selectedEntry = signal<BlacklistEntry | null>(null);
  mode = signal<'list' | 'detail' | 'add'>('list');

  form = this.fb.group({
    nama_lengkap: ['', Validators.required],
    alamat: ['', Validators.required],
    kabupaten_kota: ['', Validators.required],
    kronologi: ['', Validators.required],
    no_identitas: ['', Validators.required],
    status_active: [true],
    waktu_entry: [''],
    waktu_deactivated: [''],
  });

  searchTerm = signal<string>('');

  filteredEntries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.entries();
    return this.entries().filter((e) => e.nama_lengkap.toLowerCase().includes(term));
  });

  constructor() {
    this.loadEntries();
  }

  loadEntries(force = false) {
    this.blacklistService.getAll().subscribe((data) => {
      this.entries.set(data);
    });
  }

  showAdd() {
    this.form.reset({ status_active: true, waktu_entry: new Date().toISOString() });
    this.mode.set('add');
  }

  showDetail(entry: BlacklistEntry) {
    this.selectedEntry.set(entry);
    this.form.patchValue(entry);
    this.mode.set('detail');
  }

  saveNew() {
    if (this.form.valid) {
      this.blacklistService.add(this.form.value as BlacklistEntry).subscribe(() => {
        this.loadEntries(true);
        this.mode.set('list');
      });
    }
  }

  update() {
    const entry = this.selectedEntry();
    if (entry && this.form.valid) {
      this.confirmationService.confirm({
        message: 'Yakin ingin memperbarui data customer ini?',
        header: 'Konfirmasi Update',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.blacklistService
            .update(entry.id!, this.form.value as BlacklistEntry)
            .subscribe(() => {
              this.loadEntries(true);
              this.mode.set('list');
            });
        },
      });
    }
  }

  delete() {
    const entry = this.selectedEntry();
    if (entry) {
      this.confirmationService.confirm({
        message: 'Yakin ingin menghapus customer ini dari blacklist?',
        header: 'Konfirmasi Hapus',
        icon: 'pi pi-trash',
        acceptLabel: 'Ya, Hapus',
        rejectLabel: 'Batal',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-sm',
        accept: () => {
          this.blacklistService
            .delete(entry.id!)
            .subscribe(() => {
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
  }
}
