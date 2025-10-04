import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';

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

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this._activatedRoute
      .data
      .pipe(takeUntil(this.Destroy$))
      .subscribe((result) => {
        this.Title = result['title'];
      })
  }

  ngOnDestroy(): void {
    this.Destroy$.next(0);
    this.Destroy$.complete();
  }

  onBackToHome() {
    this._router.navigateByUrl("/home");
  }
}
