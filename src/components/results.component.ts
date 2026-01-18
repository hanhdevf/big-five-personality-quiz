import { Component, inject, signal } from '@angular/core';
import { QuizService } from '../services/quiz.service';
import { RadarChartComponent } from './radar-chart.component';
import { ChatOverlayComponent } from './chat-overlay.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [RadarChartComponent, CommonModule, ChatOverlayComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-6 md:px-12 text-slate-800 font-quicksand relative">
      
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center min-h-[80vh] text-center animate-pulse">
          <div class="w-24 h-24 border-8 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mb-8"></div>
          <h2 class="text-3xl font-bold text-fuchsia-900 mb-3">Đang Kết Nối Dữ Liệu...</h2>
          <p class="text-xl text-slate-600 font-medium">Chờ một chút nhé, AI đang vẽ chân dung tính cách của bạn.</p>
        </div>
      } @else {
        
        <!-- Main Container -->
        <div class="w-full max-w-6xl mx-auto animate-fade-in pb-20">
          
          <!-- HEADER CARD -->
          <div class="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-purple-200 mb-10 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 group-hover:scale-110 transition-transform duration-[20s]"></div>
            <div class="relative z-10">
              <span class="inline-block py-2 px-6 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold tracking-widest uppercase mb-6 border border-white/40 shadow-sm">
                Hồ Sơ Tính Cách Big Five
              </span>
              <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-md">
                {{ analysis()?.title || 'Người Bạn Đầy Màu Sắc' }}
              </h1>
              <p class="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto font-medium opacity-95">
                "Hiểu mình là bước đầu tiên để chinh phục thế giới."
              </p>
            </div>
          </div>

          <!-- SUMMARY SECTION -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-10">
            <!-- Left: Radar Chart & Vertical Stats -->
            <div class="xl:col-span-5 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100 border border-white flex flex-col items-center">
               <h3 class="text-lg font-bold text-slate-600 mb-6 flex items-center gap-2 uppercase tracking-wider self-start w-full justify-center border-b border-slate-100 pb-4">
                <span class="text-xl">📊</span> Bản Đồ Năng Lượng
              </h3>
              
              <div class="w-full max-w-[320px] mb-8">
                <app-radar-chart [scores]="scores()" />
              </div>
               
               <!-- Vertical Stats List (Replaces Horizontal Boxes) -->
              <div class="w-full space-y-5 px-2">
                
                <!-- O: Sáng Tạo -->
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-sky-800 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span class="bg-sky-100 text-sky-600 px-1.5 rounded text-xs">O</span> Sáng Tạo
                    </span>
                    <span class="text-sky-600 font-bold text-lg">{{ scores().O }}%</span>
                  </div>
                  <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div class="h-full bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-1000 ease-out" [style.width.%]="scores().O"></div>
                  </div>
                </div>

                <!-- C: Tận Tâm -->
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-emerald-800 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span class="bg-emerald-100 text-emerald-600 px-1.5 rounded text-xs">C</span> Tận Tâm
                    </span>
                    <span class="text-emerald-600 font-bold text-lg">{{ scores().C }}%</span>
                  </div>
                  <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div class="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out" [style.width.%]="scores().C"></div>
                  </div>
                </div>

                <!-- E: Hướng Ngoại -->
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-amber-800 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span class="bg-amber-100 text-amber-600 px-1.5 rounded text-xs">E</span> Hướng Ngoại
                    </span>
                    <span class="text-amber-600 font-bold text-lg">{{ scores().E }}%</span>
                  </div>
                  <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div class="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out" [style.width.%]="scores().E"></div>
                  </div>
                </div>

                <!-- A: Hòa Đồng -->
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-rose-800 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span class="bg-rose-100 text-rose-600 px-1.5 rounded text-xs">A</span> Hòa Đồng
                    </span>
                    <span class="text-rose-600 font-bold text-lg">{{ scores().A }}%</span>
                  </div>
                  <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div class="h-full bg-rose-400 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.5)] transition-all duration-1000 ease-out" [style.width.%]="scores().A"></div>
                  </div>
                </div>

                <!-- N: Cảm Xúc -->
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-violet-800 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span class="bg-violet-100 text-violet-600 px-1.5 rounded text-xs">N</span> Cảm Xúc
                    </span>
                    <span class="text-violet-600 font-bold text-lg">{{ scores().N }}%</span>
                  </div>
                  <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div class="h-full bg-violet-400 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-1000 ease-out" [style.width.%]="scores().N"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Right: The Story -->
            <div class="xl:col-span-7 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-indigo-100 border border-white">
               <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <span class="bg-indigo-100 text-indigo-600 p-2.5 rounded-2xl text-2xl">📖</span> 
                Câu Chuyện Của Bạn
              </h2>
              <div class="space-y-5">
                 @for (html of processText(analysis()?.summary, 'text-indigo-600'); track $index) {
                    <p class="text-lg md:text-xl font-normal leading-loose text-slate-700 text-justify" [innerHTML]="html"></p>
                 }
              </div>
            </div>
          </div>

          <!-- DEEP DIVE ACCORDIONS -->
          <div class="space-y-6 mb-12">
            <h3 class="text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-8">Phân Tích Chuyên Sâu</h3>

            <!-- 1. Work Style (Sky Blue) -->
            <details class="group bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white overflow-hidden open:shadow-xl open:border-sky-300 transition-all duration-300">
              <summary class="flex justify-between items-center p-6 md:p-10 cursor-pointer select-none bg-gradient-to-r from-transparent via-transparent to-transparent group-open:from-sky-50 group-open:to-white/50 transition-colors">
                <div class="flex items-center gap-5">
                  <div class="bg-sky-100 text-sky-600 p-3 rounded-2xl text-3xl group-open:bg-sky-500 group-open:text-white transition-colors shadow-sm">💼</div>
                  <h3 class="text-xl md:text-2xl font-bold text-slate-700 group-open:text-sky-800">Phong Cách Làm Việc</h3>
                </div>
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-open:bg-sky-200 group-open:text-sky-700 group-open:rotate-180 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </summary>
              <div class="bg-sky-50/30">
                <div class="p-8 md:p-12 pt-0 border-t border-sky-100/50">
                  <div class="space-y-5 mt-6">
                    @for (html of processText(analysis()?.work_style, 'text-sky-600'); track $index) {
                      <p class="text-lg md:text-xl font-normal leading-loose text-slate-700 text-justify" [innerHTML]="html"></p>
                    }
                  </div>
                </div>
              </div>
            </details>

            <!-- 2. Relationship Style (Rose Pink) -->
            <details class="group bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white overflow-hidden open:shadow-xl open:border-rose-300 transition-all duration-300">
              <summary class="flex justify-between items-center p-6 md:p-10 cursor-pointer select-none bg-gradient-to-r from-transparent via-transparent to-transparent group-open:from-rose-50 group-open:to-white/50 transition-colors">
                <div class="flex items-center gap-5">
                  <div class="bg-rose-100 text-rose-600 p-3 rounded-2xl text-3xl group-open:bg-rose-500 group-open:text-white transition-colors shadow-sm">❤️</div>
                  <h3 class="text-xl md:text-2xl font-bold text-slate-700 group-open:text-rose-800">Tương Tác Xã Hội</h3>
                </div>
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-open:bg-rose-200 group-open:text-rose-700 group-open:rotate-180 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </summary>
              <div class="bg-rose-50/30">
                <div class="p-8 md:p-12 pt-0 border-t border-rose-100/50">
                  <div class="space-y-5 mt-6">
                    @for (html of processText(analysis()?.relationship_style, 'text-rose-600'); track $index) {
                      <p class="text-lg md:text-xl font-normal leading-loose text-slate-700 text-justify" [innerHTML]="html"></p>
                    }
                  </div>
                </div>
              </div>
            </details>

            <!-- 3. Life Analysis (Violet) -->
            <details class="group bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white overflow-hidden open:shadow-xl open:border-violet-300 transition-all duration-300">
              <summary class="flex justify-between items-center p-6 md:p-10 cursor-pointer select-none bg-gradient-to-r from-transparent via-transparent to-transparent group-open:from-violet-50 group-open:to-white/50 transition-colors">
                <div class="flex items-center gap-5">
                  <div class="bg-violet-100 text-violet-600 p-3 rounded-2xl text-3xl group-open:bg-violet-500 group-open:text-white transition-colors shadow-sm">🔮</div>
                  <h3 class="text-xl md:text-2xl font-bold text-slate-700 group-open:text-violet-800">Dự Báo Đời Sống</h3>
                </div>
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-open:bg-violet-200 group-open:text-violet-700 group-open:rotate-180 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </summary>
              <div class="bg-violet-50/30">
                <div class="p-6 md:p-10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-violet-100/50">
                   <!-- Finance -->
                  <div class="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-sm">
                    <h4 class="font-bold text-emerald-700 mb-4 flex items-center gap-3 text-xl">💰 Tài Chính</h4>
                    <div class="space-y-3">
                       @for (html of processText(analysis()?.life_analysis?.finance, 'text-emerald-600'); track $index) { 
                         <p class="text-base md:text-lg text-slate-700 leading-relaxed font-normal" [innerHTML]="html"></p> 
                       }
                    </div>
                  </div>
                  <!-- Health -->
                  <div class="bg-white p-8 rounded-[2rem] border border-teal-100 shadow-sm">
                    <h4 class="font-bold text-teal-700 mb-4 flex items-center gap-3 text-xl">🥑 Sức Khỏe</h4>
                     <div class="space-y-3">
                       @for (html of processText(analysis()?.life_analysis?.health, 'text-teal-600'); track $index) { 
                         <p class="text-base md:text-lg text-slate-700 leading-relaxed font-normal" [innerHTML]="html"></p> 
                       }
                    </div>
                  </div>
                  <!-- Stress -->
                  <div class="bg-white p-8 rounded-[2rem] border border-orange-100 shadow-sm">
                    <h4 class="font-bold text-orange-700 mb-4 flex items-center gap-3 text-xl">🌪️ Stress</h4>
                     <div class="space-y-3">
                       @for (html of processText(analysis()?.life_analysis?.stress, 'text-orange-600'); track $index) { 
                         <p class="text-base md:text-lg text-slate-700 leading-relaxed font-normal" [innerHTML]="html"></p> 
                       }
                    </div>
                  </div>
                   <!-- Learning -->
                  <div class="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-sm">
                    <h4 class="font-bold text-blue-700 mb-4 flex items-center gap-3 text-xl">🧠 Học Tập</h4>
                     <div class="space-y-3">
                       @for (html of processText(analysis()?.life_analysis?.learning, 'text-blue-600'); track $index) { 
                         <p class="text-base md:text-lg text-slate-700 leading-relaxed font-normal" [innerHTML]="html"></p> 
                       }
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <!-- SECTION 4: STRATEGY COLUMNS -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <!-- Strengths (Teal) -->
            <div class="bg-teal-50 rounded-[2.5rem] p-8 border border-teal-100 hover:shadow-lg transition-shadow">
               <div class="inline-block bg-teal-200 text-teal-800 p-3 rounded-2xl mb-6 text-2xl shadow-sm">⚡</div>
               <h3 class="text-xl font-bold text-teal-900 mb-6 uppercase tracking-wide">Siêu Năng Lực</h3>
               <ul class="space-y-4">
                 @for (item of analysis()?.strengths; track item) {
                   <li class="flex gap-3 text-lg md:text-xl text-teal-950 leading-snug font-normal">
                     <span class="font-bold text-teal-500 text-xl shrink-0">•</span>
                     <span [innerHTML]="processString(item, 'text-teal-600')"></span>
                   </li>
                 }
               </ul>
            </div>

            <!-- Weaknesses (Orange) -->
            <div class="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 hover:shadow-lg transition-shadow">
               <div class="inline-block bg-orange-200 text-orange-800 p-3 rounded-2xl mb-6 text-2xl shadow-sm">🛡️</div>
               <h3 class="text-xl font-bold text-orange-900 mb-6 uppercase tracking-wide">Điểm Mù</h3>
               <ul class="space-y-4">
                 @for (item of analysis()?.weaknesses; track item) {
                   <li class="flex gap-3 text-lg md:text-xl text-orange-950 leading-snug font-normal">
                     <span class="font-bold text-orange-500 text-xl shrink-0">•</span>
                     <span [innerHTML]="processString(item, 'text-orange-600')"></span>
                   </li>
                 }
               </ul>
            </div>

            <!-- Advice (Blue) -->
            <div class="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 hover:shadow-lg transition-shadow">
               <div class="inline-block bg-blue-200 text-blue-800 p-3 rounded-2xl mb-6 text-2xl shadow-sm">💡</div>
               <h3 class="text-xl font-bold text-blue-900 mb-6 uppercase tracking-wide">Lời Khuyên</h3>
               <ul class="space-y-4">
                 @for (item of analysis()?.advice; track item) {
                   <li class="flex gap-3 text-lg md:text-xl text-blue-950 leading-snug font-normal">
                     <span class="font-bold text-blue-500 text-xl shrink-0">•</span>
                     <span [innerHTML]="processString(item, 'text-blue-600')"></span>
                   </li>
                 }
               </ul>
            </div>
          </div>

          <!-- SECTION 5: FINAL ACTION -->
          <div class="text-center bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 shadow-xl shadow-fuchsia-100 border border-white">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-10">Bạn đã sẵn sàng để khám phá lại?</h2>
            <button 
              (click)="restart()" 
              class="px-10 py-5 bg-slate-900 text-white font-bold text-xl rounded-2xl hover:bg-fuchsia-600 transition-all shadow-xl shadow-slate-300 hover:shadow-fuchsia-200 hover:-translate-y-1"
            >
              🔄 Làm Lại Trắc Nghiệm
            </button>
          </div>

        </div>

        <!-- Chat Floating Action Button -->
        <button 
          (click)="isChatOpen.set(!isChatOpen())"
          class="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-fuchsia-600 hover:bg-fuchsia-700 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
          [class.opacity-0]="isChatOpen()"
          [class.pointer-events-none]="isChatOpen()"
        >
          <span class="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">AI</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </button>

        <!-- Chat Overlay -->
        @if (isChatOpen()) {
          <app-chat-overlay (close)="isChatOpen.set(false)" />
        }

      }
    </div>
  `
})
export class ResultsComponent {
  quizService = inject(QuizService);
  sanitizer = inject(DomSanitizer);

  isLoading = this.quizService.isLoadingAI;
  analysis = this.quizService.aiResult;
  scores = this.quizService.scores;

  isChatOpen = signal(false);

  restart() {
    this.quizService.startQuiz();
  }

  // Handle simple string lists (bullets)
  processString(text: string, highlightClass: string): SafeHtml {
    if (!text) return '';
    const processed = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      // Changed from font-black to font-bold for a lighter look
      return `<span class="${highlightClass} font-semibold">${p1}</span>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }

  // Handle multi-line text blocks
  processText(text: string | undefined, highlightClass: string): SafeHtml[] {
    if (!text) return [];

    // Split lines for paragraphs
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    return lines.map(line => {
      const processed = line.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        // Changed from font-black to font-bold
        return `<span class="${highlightClass} font-semibold">${p1}</span>`;
      });
      return this.sanitizer.bypassSecurityTrustHtml(processed);
    });
  }
}