import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  patient: { name: string; age: string | number; examDate: string } = {
    name: 'Patient inconnu',
    age: '-',
    examDate: '-'
  };

  imageMLO: {
    preview: string | null;
    birads: string;
    report: string;
    description: string;
    localization?: string;
  } = { preview: null, birads: 'N/A', report: '', description: '', localization: '' };

  imageCC: {
    preview: string | null;
    birads: string;
    report: string;
    description: string;
    localization?: string;
  } = { preview: null, birads: 'N/A', report: '', description: '', localization: '' };

  globalBirads  = 'N/A';
  description   = '';
  warning       = '';
  details: any  = null;

  constructor(private router: Router) {
    // Récupère l'état transmis depuis ImportComponent via router.navigate
    const nav   = this.router.getCurrentNavigation()?.extras?.state as any;
    const state = nav ?? (typeof history !== 'undefined' ? history.state : {});

    if (state?.patient)     this.patient      = state.patient;
    if (state?.imageMLO)    this.imageMLO     = state.imageMLO;
    if (state?.imageCC)     this.imageCC      = state.imageCC;
    if (state?.globalBirads) this.globalBirads = String(state.globalBirads);
    if (state?.description)  this.description  = state.description;
    if (state?.warning)      this.warning      = state.warning;
    if (state?.details)      this.details      = state.details;
  }

  /** Renvoie le libellé BI-RADS selon la catégorie */
  getBiradsLabel(birads: string): string {
    const map: Record<string, string> = {
      '0': 'Incomplet',
      '1': 'Négatif',
      '2': 'Bénin',
      '3': 'Probablement bénin',
      '4': 'Suspect',
      '4A': 'Faiblement suspect',
      '4B': 'Modérément suspect',
      '4C': 'Fortement suspect',
      '5': 'Très fortement suspect',
      '6': 'Malignité prouvée'
    };
    return map[String(birads)] ?? 'Non classé';
  }

  exportReport() {
    const lines = [
      '═══════════════════════════════════════════',
      '           RAPPORT MAMMOGRAPHIQUE BI-RADS   ',
      '═══════════════════════════════════════════',
      '',
      `Patient    : ${this.patient.name}`,
      `Âge        : ${this.patient.age} ans`,
      `Date examen: ${this.patient.examDate}`,
      '',
      `BI-RADS Global : ${this.globalBirads} – ${this.getBiradsLabel(this.globalBirads)}`,
      '',
      '───────────────────────────────────────────',
      '  VUE MLO (Médio-Latérale Oblique)',
      '───────────────────────────────────────────',
      `  BI-RADS     : ${this.imageMLO.birads}`,
      `  Description : ${this.imageMLO.description || this.imageMLO.report || 'N/A'}`,
      `  Localisation: ${this.imageMLO.localization || 'Non précisée'}`,
      '',
      '───────────────────────────────────────────',
      '  VUE CC (Cranio-Caudale)',
      '───────────────────────────────────────────',
      `  BI-RADS     : ${this.imageCC.birads}`,
      `  Description : ${this.imageCC.description || this.imageCC.report || 'N/A'}`,
      `  Localisation: ${this.imageCC.localization || 'Non précisée'}`,
      '',
      '───────────────────────────────────────────',
      '  CONCLUSION',
      '───────────────────────────────────────────',
      `  ${this.description || 'Voir classification BI-RADS ci-dessus.'}`,
      '',
      this.warning ? `⚠ Avertissement : ${this.warning}` : '',
      '',
      '  Rapport généré automatiquement – doit être',
      '  validé par un radiologue qualifié.',
      '═══════════════════════════════════════════'
    ];

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `rapport_birads_${String(this.patient.name).replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}