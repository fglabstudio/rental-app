import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login';
import { BlacklistService } from '../../services/blacklist';
import { UnitService } from '../../services/unit';
import { FileExport } from '../../services/file-export';
import { BlacklistEntry } from '../../model/pages/blacklist.model';
import { UnitEntry } from '../../model/pages/unit.model';
import { User } from '../../model/pages/authentication.model';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnDestroy {

  Destroy$ = new Subject();

  Title: string = "Home";

  private loginService = inject(LoginService);
  _userData = this.loginService.getProfile();

  private unitService = inject(UnitService);
  private exportFileService = inject(FileExport);

  userEntries = signal<User[]>([]);
  unitEntries = signal<UnitEntry[]>([]);


  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this._activatedRoute
      .data
      .pipe(takeUntil(this.Destroy$))
      .subscribe((result) => {
        this.Title = result['title'];
      });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.Destroy$.next(0);
    this.Destroy$.complete();
  }

  onBackToHome() {
    this._router.navigateByUrl("/home");
  }

  loadData() {
    this.loginService.getAllUser().subscribe(data => this.userEntries.set(data));
    this.unitService.getAll().subscribe(data => this.unitEntries.set(data));
  }

  export() {
    const units = this.unitEntries();
    const users = this.userEntries();
    this.exportFileService.exportUnitsByUser(units, users);
  }
}
