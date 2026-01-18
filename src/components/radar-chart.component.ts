import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  template: `
    <div class="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl">
        <!-- Background Grid -->
        @for (level of [20, 40, 60, 80, 100]; track level) {
          <polygon 
            [attr.points]="getPolygonPoints(level)" 
            fill="none" 
            stroke="#e2e8f0" 
            stroke-width="0.5" 
          />
        }

        <!-- Axes Lines -->
        @for (axis of axes; track axis.label; let i = $index) {
          <line 
            x1="50" y1="50" 
            [attr.x2]="getPoint(100, i).x" 
            [attr.y2]="getPoint(100, i).y" 
            stroke="#cbd5e1" 
            stroke-width="0.5" 
          />
          <!-- Axis Labels (Translated & Shortened) -->
          <text 
            [attr.x]="getPoint(112, i).x" 
            [attr.y]="getPoint(112, i).y" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            class="text-[4px] font-bold fill-slate-500 uppercase tracking-tighter"
          >
            {{ axis.label }}
          </text>
        }

        <!-- Data Polygon -->
        <polygon 
          [attr.points]="dataPoints()" 
          fill="rgba(139, 92, 246, 0.3)" 
          stroke="#7c3aed" 
          stroke-width="2" 
          class="transition-all duration-1000 ease-out"
        />
        
        <!-- Data Dots -->
        @for (axis of axes; track axis.label; let i = $index) {
          <circle 
            [attr.cx]="getPoint(axis.value, i).x" 
            [attr.cy]="getPoint(axis.value, i).y" 
            r="2" 
            fill="#7c3aed"
            stroke="white"
            stroke-width="0.5"
            class="transition-all duration-1000 ease-out"
          />
        }
      </svg>
    </div>
  `
})
export class RadarChartComponent implements OnChanges {
  @Input({ required: true }) scores!: { O: number; C: number; E: number; A: number; N: number };

  axes: { label: string; value: number }[] = [];
  dataPoints = signal('');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scores']) {
      this.updateChart();
    }
  }

  updateChart() {
    // Translate labels to Vietnamese for cleaner display and user requirement
    this.axes = [
      { label: 'Sáng Tạo', value: this.scores.O },
      { label: 'Tận Tâm', value: this.scores.C },
      { label: 'Hướng Ngoại', value: this.scores.E },
      { label: 'Hòa Đồng', value: this.scores.A },
      { label: 'Cảm Xúc', value: this.scores.N },
    ];

    const points = this.axes.map((axis, i) => {
      const p = this.getPoint(axis.value, i);
      return `${p.x},${p.y}`;
    }).join(' ');
    
    this.dataPoints.set(points);
  }

  getPoint(value: number, index: number): { x: number; y: number } {
    const totalAxes = 5;
    const radius = (value / 100) * 40; // Max radius 40 units from center
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2; // Start at top
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  }

  getPolygonPoints(level: number): string {
    const totalAxes = 5;
    const radius = (level / 100) * 40;
    const points: string[] = [];
    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }
}