import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <section class="report-page">
      <!-- Ambient blobs -->
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
      <div class="bg-blob blob-3"></div>

      <!-- Header -->
      <div class="page-header">
        <a routerLink="/import" class="btn-back" aria-label="Retour">←</a>
        <div class="header-meta">
          <div class="card-badge">Rapport BI-RADS</div>
          <h1>Résultats de l'analyse</h1>
          <p class="subtitle">Analyse IA réalisée le {{ patient.examDate }}</p>
        </div>
      </div>

      <!-- Summary Grid -->
      <div class="summary-grid">
        <div class="summary-card">
          <span class="label">Patient</span>
          <strong>{{ patient.name || 'Patient inconnu' }}</strong>
        </div>
        <div class="summary-card">
          <span class="label">Âge</span>
          <strong>{{ patient.age ? patient.age + ' ans' : '-' }}</strong>
        </div>
        <div class="summary-card">
          <span class="label">Date d'examen</span>
          <strong>{{ patient.examDate || '-' }}</strong>
        </div>
        <div class="summary-card birads-global">
          <span class="label">BI-RADS Global</span>
          <strong class="birads-value">{{ globalBirads }}</strong>
        </div>
      </div>

      <!-- Images Grid -->
      <div class="report-grid">
        <!-- MLO Card -->
        <article class="report-card">
          <div class="card-header">
            <div>
              <p class="view-title">Vue MLO</p>
              <span class="view-subtitle">Médio-latérale oblique</span>
            </div>
            <span class="badge birads-badge">BI-RADS {{ imageMLO.birads }}</span>
          </div>
          
          <div class="card-body">
            <div class="image-preview">
              <img *ngIf="imageMLO.preview; else mloEmpty" [src]="imageMLO.preview" alt="MLO" />
              <ng-template #mloEmpty>
                <div class="image-placeholder">Aucune image MLO disponible</div>
              </ng-template>
            </div>

            <div class="analysis-card">
              <p class="classification">BI-RADS {{ imageMLO.birads }} – Suspect</p>
              <p class="report-text">{{ imageMLO.report }}</p>
              <ul class="findings">
                <li><strong>Localisation :</strong> {{ imageMLO.localization || 'Non précisée' }}</li>
                <li><strong>Description :</strong> {{ imageMLO.description || 'Aucune description disponible' }}</li>
              </ul>
            </div>
          </div>
        </article>

        <!-- CC Card -->
        <article class="report-card">
          <div class="card-header">
            <div>
              <p class="view-title">Vue CC</p>
              <span class="view-subtitle">Cranio-caudale</span>
            </div>
            <span class="badge birads-badge">BI-RADS {{ imageCC.birads }}</span>
          </div>
          
          <div class="card-body">
            <div class="image-preview">
              <img *ngIf="imageCC.preview; else ccEmpty" [src]="imageCC.preview" alt="CC" />
              <ng-template #ccEmpty>
                <div class="image-placeholder">Aucune image CC disponible</div>
              </ng-template>
            </div>

            <div class="analysis-card">
              <p class="classification">BI-RADS {{ imageCC.birads }} – Suspect</p>
              <p class="report-text">{{ imageCC.report }}</p>
              <ul class="findings">
                <li><strong>Localisation :</strong> {{ imageCC.localization || 'Non précisée' }}</li>
                <li><strong>Description :</strong> {{ imageCC.description || 'Aucune description disponible' }}</li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <!-- Global Report -->
      <div class="global-report">
        <div class="details-header">
          <h2>Rapport global généré par IA</h2>
        </div>
        <div class="details-content">
          <p><strong>Conclusion :</strong> Suspicion modérée avec BI-RADS {{ globalBirads }}. Une évaluation radiologique complémentaire est recommandée.</p>
          <p><strong>Technique :</strong> Mammographie numérique bilatérale, vues standard MLO et CC.</p>
          <p><strong>Recommandation :</strong> Biopsie ou imagerie complémentaire (échographie / IRM) selon contexte clinique.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-row">
        <button class="btn-primary" (click)="exportReport()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exporter le rapport
        </button>
        <a routerLink="/import" class="btn-secondary">Nouvelle analyse</a>
      </div>
    </section>
  `,
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  patient = { name: 'Patient inconnu', age: '-', examDate: '-' };
  imageMLO: any = { preview: null, birads: '4A', report: 'Pas de rapport disponible.', description: '', localization: '' };
  imageCC: any = { preview: null, birads: '4A', report: 'Pas de rapport disponible.', description: '', localization: '' };
  globalBirads = '4A';

  constructor(private router: Router) {
    const navState = this.router.getCurrentNavigation()?.extras.state as any || history.state;
    if (navState?.patient) this.patient = navState.patient;
    if (navState?.imageMLO) this.imageMLO = navState.imageMLO;
    if (navState?.imageCC) this.imageCC = navState.imageCC;
    if (navState?.globalBirads) this.globalBirads = navState.globalBirads;
  }

  exportReport() {
    const content = `Rapport BI-RADS\nPatient: ${this.patient.name}\nÂge: ${this.patient.age} ans\nDate: ${this.patient.examDate}\n\n` +
                   `MLO: BI-RADS ${this.imageMLO.birads} - ${this.imageMLO.report}\n` +
                   `CC: BI-RADS ${this.imageCC.birads} - ${this.imageCC.report}\n\n` +
                   `Conclusion: BI-RADS ${this.globalBirads}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_birads_${this.patient.name.replace(/\s/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}