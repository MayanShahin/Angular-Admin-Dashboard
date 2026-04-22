
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // 1. Add this import
import { Sidebar } from '../sidebar/sidebar'; 
import { Navbar } from '../navbar/navbar';   

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Sidebar, Navbar, RouterOutlet], // 2. Add RouterOutlet here
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {}