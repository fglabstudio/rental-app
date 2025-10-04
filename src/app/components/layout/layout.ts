import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-layout',
  imports: [
    Navbar,
    Footer
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true
})
export class Layout {

}
