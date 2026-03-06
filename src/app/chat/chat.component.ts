import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  afterRenderEffect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe } from '@angular/common';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TextFieldModule,
    DatePipe,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  protected readonly chatService = inject(ChatService);
  protected prompt = '';
  protected copiedMessageId: number | null = null;
  private wasLoading: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('promptInput') private promptInput!: ElementRef<HTMLTextAreaElement>;

  constructor() {
    afterNextRender(() => {
      this.promptInput?.nativeElement?.focus();
    });

    afterRenderEffect(() => {
      this.chatService.messages();
      this.chatService.loading();
      this.scrollToBottom();

      const isLoading = this.chatService.loading();
      if (this.wasLoading && !isLoading && this.chatService.hasMessages()) {
        setTimeout(() => {
          this.promptInput?.nativeElement?.focus();
        }, 0);
      }
      this.wasLoading = isLoading;
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      requestAnimationFrame(() => {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      });
    }
  }

  loadMoreMessages(): void {
    this.chatService.loadMoreMessages();
  }

  async onSubmit(): Promise<void> {
    if (!this.prompt.trim() || this.chatService.loading()) return;

    const message = this.prompt;
    this.prompt = '';
    await this.chatService.sendMessage(message);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onClear(): void {
    this.chatService.clearHistory();
    this.promptInput?.nativeElement?.focus();
  }

  async copyMessage(content: string, timestamp: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      this.copiedMessageId = timestamp;
      setTimeout(() => {
        this.copiedMessageId = null;
      }, 2000);
    } catch {
      console.error('Failed to copy message');
    }
  }
}
