import { Component, computed, inject, signal } from '@angular/core';
import { Layout } from "../../components/layout/layout";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { BlacklistEntry } from '../../model/pages/blacklist.model';
import { UnitEntry } from '../../model/pages/unit.model';
import { BlacklistService } from '../../services/blacklist';
import { UnitService } from '../../services/unit';

@Component({
  selector: 'app-home',
  imports: [
    Layout,
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true
})
export class Home {
  private blacklistService = inject(BlacklistService);
  private unitService = inject(UnitService);

  // Signals
  blacklistEntries = signal<BlacklistEntry[]>([]);
  unitEntries = signal<UnitEntry[]>([]);
  searchBlacklist = signal<string>('');
  searchUnit = signal<string>('');

  filteredBlacklist = computed(() => {
    const term = this.searchBlacklist().toLowerCase();
    if (!term) return this.blacklistEntries();
    return this.blacklistEntries().filter(e =>
      e.nama_lengkap.toLowerCase().includes(term)
    );
  });

  filteredUnit = computed(() => {
    const term = this.searchUnit().toLowerCase();
    if (!term) return this.unitEntries();
    return this.unitEntries().filter(u =>
      u.plat_nomor.toLowerCase().includes(term) ||
      u.nama_pemilik.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.blacklistService.getAll().subscribe(data => this.blacklistEntries.set(data));
    this.unitService.getAll().subscribe(data => this.unitEntries.set(data));
  }
}
