import { Component, inject } from '@angular/core';
import { WelcomeComponent } from './components/welcome.component';
import { QuizComponent } from './components/quiz.component';
import { ResultsComponent } from './components/results.component';
import { QuizService } from './services/quiz.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, QuizComponent, ResultsComponent],
  template: `
    <main class="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 text-slate-800 font-sans selection:bg-teal-200">
      @switch (currentScreen()) {
        @case ('welcome') {
          <app-welcome />
        }
        @case ('quiz') {
          <app-quiz />
        }
        @case ('results') {
          <app-results />
        }
      }
      
      <!-- Footer Copyright -->
      <footer class="fixed bottom-0 w-full text-center p-2 text-[10px] text-slate-400 pointer-events-none">
        © 2024 Big Five Personality AI
      </footer>
    </main>
  `
})
export class AppComponent {
  quizService = inject(QuizService);
  currentScreen = this.quizService.currentScreen;
}