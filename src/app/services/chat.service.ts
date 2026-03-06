import { Injectable, signal, computed } from '@angular/core';
import { ChatMessage } from '../models/chat-message.model';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'chatterbox_history';
const VISIBLE_MESSAGES_COUNT = 10;

interface ChatCompletionResponse {
  choices: { message: { content: string; role: string } }[];
  error?: { message: string };
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = 'https://router.huggingface.co/v1/chat/completions';

  readonly messages = signal<ChatMessage[]>(this.loadHistory());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly messagesStartIndex = signal(this.calculateInitialStartIndex());

  readonly visibleMessages = computed(() => {
    const allMessages = this.messages();
    const startIdx = this.messagesStartIndex();
    return allMessages.slice(startIdx);
  });

  readonly hasMessages = computed(() => this.messages().length > 0);

  readonly hasMoreMessages = computed(() => this.messagesStartIndex() > 0);

  async sendMessage(prompt: string): Promise<void> {
    if (!prompt.trim()) return;

    this.error.set(null);

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: Date.now(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.loading.set(true);

    try {
      const response = await this.callApi(prompt.trim());

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      this.messages.update((msgs) => [...msgs, assistantMessage]);
      this.saveHistory();
      this.resetViewToLatest();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      this.error.set(message);
      this.messages.update((msgs) => msgs.filter((m) => m !== userMessage));
    } finally {
      this.loading.set(false);
    }
  }

  clearHistory(): void {
    this.messages.set([]);
    this.error.set(null);
    this.messagesStartIndex.set(0);
    localStorage.removeItem(STORAGE_KEY);
  }

  loadMoreMessages(): void {
    const currentStartIdx = this.messagesStartIndex();
    const newStartIdx = Math.max(0, currentStartIdx - VISIBLE_MESSAGES_COUNT);
    this.messagesStartIndex.set(newStartIdx);
  }

  private resetViewToLatest(): void {
    const totalMessages = this.messages().length;
    const startIdx = Math.max(0, totalMessages - VISIBLE_MESSAGES_COUNT);
    this.messagesStartIndex.set(startIdx);
  }

  private calculateInitialStartIndex(): number {
    const history = this.loadHistory();
    return Math.max(0, history.length - VISIBLE_MESSAGES_COUNT);
  }

  private async callApi(prompt: string): Promise<string> {
    const conversationMessages = this.buildConversationMessages(prompt);

    const body = {
      model: environment.huggingFaceModel,
      messages: conversationMessages,
      temperature: 0.7,
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${environment.huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`AI API error (${res.status}): ${errorBody}`);
    }

    const data: ChatCompletionResponse = await res.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response received from the AI model.');
    }

    return content.trim();
  }

  /**
   * Builds an OpenAI-compatible messages array from conversation history.
   */
  private buildConversationMessages(currentPrompt: string): { role: string; content: string }[] {
    const history = this.messages();
    const recentHistory = history.slice(-6);

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: 'You are a helpful, friendly AI assistant.' },
    ];

    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: 'user', content: currentPrompt });
    return messages;
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    } catch {
      // localStorage may be full or unavailable
    }
  }

  private loadHistory(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
