import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-shell">
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `:host { display: block; background: linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%); min-height: 100vh; color: #0f172a; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`,
    `.app-shell { max-width: 1280px; margin: 0 auto; padding: 24px 20px 32px; }`,
    `.app-content { min-height: calc(100vh - 120px); }`,
    `@media (max-width: 900px) { .app-header { flex-direction: column; align-items: flex-start; } .app-shell { padding: 18px 16px 28px; } }`
  ]
})
export class AppComponent {}
