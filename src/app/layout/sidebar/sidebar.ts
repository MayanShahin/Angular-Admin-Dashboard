import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  isCollapsed: boolean = false;

  // This pushes the rest of the page content to the right on big screens
  @HostBinding('style.width') get width() {
    return this.isCollapsed ? '0px' : '260px';
  }

  // Ensures the "pushing" animation is smooth
  @HostBinding('style.transition') transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.overflow') overflow = 'hidden';

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    // Automatically collapse on screens smaller than 768px (Mobile)
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isCollapsed = result.matches;
      });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}