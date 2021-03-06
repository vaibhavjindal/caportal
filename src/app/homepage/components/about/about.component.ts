import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {UiService} from '../../../services/ui.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  @ViewChild('about') about;

  constructor(private ui: UiService) {
  }

  ngOnInit() {
  }

  @HostListener('window:scroll', ['$event'])
  private onScroll($event: Event): void {
    this.ui.scrollPos.next(window.scrollY > this.about.nativeElement.offsetTop);
  }
}
