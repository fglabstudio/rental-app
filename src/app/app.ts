import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'
import { Loading } from "./components/loading/loading";
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastModule,
    Loading
  ],
  templateUrl: './app.html',
  standalone: true,
})
export class App {
  protected readonly title = signal('rental-app');
}
