import { Component, inject } from '@angular/core';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center animate-fade-in w-full max-w-5xl mx-auto">
      <div class="mb-10 p-10 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50">
        <span class="text-8xl md:text-9xl block hover:scale-110 transition-transform cursor-default">🧠</span>
      </div>
      
      <h1 class="text-5xl md:text-7xl font-extrabold text-teal-900 mb-8 tracking-tight leading-tight">
        Khám Phá <br class="md:hidden" />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Tính Cách Thật</span>
      </h1>
      
      <p class="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl leading-relaxed font-light">
        Trắc nghiệm tâm lý học chuẩn <strong>Big Five (OCEAN)</strong>. 
        <br/>60 tình huống chi tiết giúp bạn thấu hiểu bản thân sâu sắc hơn.
      </p>
      
      <button 
        (click)="start()"
        class="group relative px-12 py-6 bg-teal-600 text-white font-bold text-2xl md:text-3xl rounded-2xl shadow-xl shadow-teal-200 hover:bg-teal-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
      >
        <span class="relative z-10 flex items-center gap-4">
          Bắt Đầu Ngay
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8 group-hover:translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </button>

      <div class="mt-20 grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 w-full px-4">
        <div class="flex flex-col items-center group">
          <span class="bg-blue-100 text-blue-700 font-bold px-5 py-3 rounded-2xl mb-3 text-lg group-hover:scale-110 transition shadow-sm">O</span>
          <span class="text-slate-500 font-bold text-sm md:text-base">Sáng Tạo</span>
        </div>
        <div class="flex flex-col items-center group">
          <span class="bg-green-100 text-green-700 font-bold px-5 py-3 rounded-2xl mb-3 text-lg group-hover:scale-110 transition shadow-sm">C</span>
          <span class="text-slate-500 font-bold text-sm md:text-base">Tận Tâm</span>
        </div>
        <div class="flex flex-col items-center group">
          <span class="bg-yellow-100 text-yellow-700 font-bold px-5 py-3 rounded-2xl mb-3 text-lg group-hover:scale-110 transition shadow-sm">E</span>
          <span class="text-slate-500 font-bold text-sm md:text-base">Hướng Ngoại</span>
        </div>
        <div class="flex flex-col items-center group">
          <span class="bg-pink-100 text-pink-700 font-bold px-5 py-3 rounded-2xl mb-3 text-lg group-hover:scale-110 transition shadow-sm">A</span>
          <span class="text-slate-500 font-bold text-sm md:text-base">Hòa Đồng</span>
        </div>
        <div class="flex flex-col items-center group">
          <span class="bg-red-100 text-red-700 font-bold px-5 py-3 rounded-2xl mb-3 text-lg group-hover:scale-110 transition shadow-sm">N</span>
          <span class="text-slate-500 font-bold text-sm md:text-base">Cảm Xúc</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class WelcomeComponent {
  quizService = inject(QuizService);

  start() {
    this.quizService.startQuiz();
  }
}