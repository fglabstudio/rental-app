import { Component, OnDestroy } from '@angular/core';
import { DialogModule } from 'primeng/dialog'
import { HttpOperation } from '../../services/http-operation';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loading',
  imports: [
    DialogModule,
  ],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  standalone: true
})
export class Loading implements OnDestroy {

  Destroy$ = new Subject();

  _showLoading = false;

  constructor(
    private _httpService: HttpOperation
  ) {
    this._httpService
      ._showLoading
      .pipe(takeUntil(this.Destroy$))
      .subscribe((result) => {
        this._showLoading = result;
      })
  }

  ngOnDestroy(): void {
    this.Destroy$.next(0);
    this.Destroy$.complete();
  }
}
