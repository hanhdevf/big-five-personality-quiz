import { Component, inject, computed } from '@angular/core';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  template: `
    <div class="w-full max-w-4xl mx-auto px-6 py-10 min-h-screen flex flex-col justify-center">
      <!-- Progress -->
      <div class="mb-10 w-full">
        <div class="flex justify-between text-base font-bold text-slate-500 mb-3">
          <span>Câu {{ currentQIndex() + 1 }} / {{ totalQuestions }}</span>
          <span>{{ progress() }}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            class="bg-gradient-to-r from-teal-500 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out" 
            [style.width.%]="progress()">
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-14 mb-10 text-center animate-slide-up border border-slate-100 w-full">
        <span class="inline-block px-5 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold mb-6 tracking-wider border border-teal-100 uppercase">
          {{ getCategoryLabel(currentQuestion().category) }}
        </span>
        
        <h2 class="text-2xl md:text-4xl font-extrabold text-slate-800 mb-10 leading-snug">
          {{ currentQuestion().text }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          @for (option of options; track option.value) {
            <button 
              (click)="selectAnswer(option.value)"
              [disabled]="isTransitioning()"
              [class.opacity-50]="isTransitioning()"
              class="group flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
              border-slate-100 bg-slate-50/50 hover:border-teal-500 hover:bg-teal-50 text-slate-600 hover:text-teal-700 disabled:pointer-events-none min-h-[140px]"
            >
              <span class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{{ option.emoji }}</span>
              <span class="text-sm md:text-base font-bold">{{ option.label }}</span>
            </button>
          }
        </div>
      </div>
      
      <div class="text-center text-slate-400 font-medium text-base">
        Chọn mức độ phù hợp nhất với bản thân bạn
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class QuizComponent {
  quizService = inject(QuizService);
  
  currentQIndex = this.quizService.currentQuestionIndex;
  
  // Robust computed: falls back to the first question if index is momentarily out of sync/bounds
  currentQuestion = computed(() => {
    const q = this.quizService.questions[this.currentQIndex()];
    return q || this.quizService.questions[0];
  });

  progress = this.quizService.progress;
  totalQuestions = this.quizService.questions.length;
  isTransitioning = this.quizService.isTransitioning;

  options = [
    { value: 1, label: 'Hoàn toàn sai', emoji: '😣' },
    { value: 2, label: 'Sai', emoji: '🙁' },
    { value: 3, label: 'Trung bình', emoji: '😐' },
    { value: 4, label: 'Đúng', emoji: '🙂' },
    { value: 5, label: 'Hoàn toàn đúng', emoji: '🤩' }
  ];

  getCategoryLabel(code: string): string {
    const map: Record<string, string> = {
      'O': 'SÁNG TẠO & CỞI MỞ',
      'C': 'TẬN TÂM & TRÁCH NHIỆM',
      'E': 'HƯỚNG NGOẠI',
      'A': 'HÒA ĐỒNG & DỄ CHỊU',
      'N': 'CẢM XÚC & NHẠY CẢM'
    };
    return map[code] || code;
  }

  selectAnswer(val: number) {
    this.quizService.answerQuestion(val);
  }
}