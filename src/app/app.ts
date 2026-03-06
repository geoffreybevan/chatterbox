import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, MatIconModule, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
