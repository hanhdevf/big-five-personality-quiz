import { Component, ElementRef, ViewChild, inject, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../services/quiz.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Main Chat Window -->
    <div 
      class="fixed bottom-24 right-4 md:bottom-28 md:right-10 w-[90vw] md:w-[960px] h-[60vh] md:h-[600px] bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 origin-bottom-right animate-scale-in"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">🤖</div>
          <div>
            <h3 class="font-bold text-white text-lg font-quicksand">Trợ Lý Tâm Lý AI</h3>
            <p class="text-violet-200 text-xs font-medium">Hiểu rõ tính cách của bạn</p>
          </div>
        </div>
        <button (click)="close.emit()" class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages Area -->
      <div #scrollContainer class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 scroll-smooth">
        @for (msg of messages(); track $index) {
          <div [class]="'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')">
            <div 
              [class]="'max-w-[85%] p-4 rounded-2xl text-base leading-relaxed shadow-sm font-quicksand font-medium ' + 
              (msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none')"
            >
              <div [innerHTML]="processText(msg.text, msg.role)"></div>
            </div>
          </div>
        }
        
        <!-- Loading Indicator -->
        @if (isLoading()) {
          <div class="flex justify-start">
            <div class="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-100"></span>
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-slate-100 shrink-0">
        <form (submit)="sendMessage()" class="relative flex items-center gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            name="userInput"
            placeholder="Hỏi AI về tính cách của bạn..." 
            class="w-full bg-slate-100 text-slate-800 placeholder-slate-400 border-none rounded-full py-4 pl-6 pr-14 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all font-quicksand font-semibold"
            autocomplete="off"
            [disabled]="isLoading()"
          >
          <button 
            type="submit" 
            [disabled]="!userInput.trim() || isLoading()"
            class="absolute right-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 translate-x-0.5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-scale-in {
      animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    /* Custom Scrollbar */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
  `]
})
export class ChatOverlayComponent {
  quizService = inject(QuizService);
  sanitizer = inject(DomSanitizer);

  // Define output using signal-based API
  close = output<void>();

  messages = this.quizService.chatMessages;
  isLoading = this.quizService.isChatLoading;

  userInput = '';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor() {
    // Auto-scroll to bottom when messages change
    effect(() => {
      this.messages(); // dependency
      this.isLoading(); // dependency
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const msg = this.userInput;
    this.userInput = ''; // clear input immediately
    this.quizService.sendChatMessage(msg);
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  processText(text: string, role: 'user' | 'model'): SafeHtml {
    if (role === 'user') return text; // User text is plain

    // Simple markdown processing for AI response
    // 1. Bold: **text** -> <span class="font-bold">text</span> (Changed from font-black text-violet-700)
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');

    // 2. Newlines -> <br>
    processed = processed.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }
}