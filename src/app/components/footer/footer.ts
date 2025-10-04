import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer {

  _router = inject(Router);

  handleNavigate(url: string) {
    this._router.navigateByUrl(url);
  }
}
