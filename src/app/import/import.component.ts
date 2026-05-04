import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ImageResult {
  preview: string | ArrayBuffer | null;
  filename: string;
  file?: File;
  birads: string;
  report: string;
  description: string;
  localization?: string;
}

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent {
  constructor(private router: Router, private http: HttpClient) {}

  patient = { name: '', age: null as number | null, examDate: '' };
  imageMLO: ImageResult = { preview: null, filename: '', birads: '', report: '', description: '' };
  imageCC:  ImageResult = { preview: null, filename: '', birads: '', report: '', description: '' };
  analysisError = '';
  isAnalyzing = false;

  private readonly apiBaseUrl = 'http://localhost:5000/api';

  onFileSelected(event: Event, view: 'MLO' | 'CC') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image: ImageResult = {
        preview: reader.result,
        filename: file.name,
        file,
        birads: '',
        report: '',
        description: ''
      };
      if (view === 'MLO') this.imageMLO = image;
      else this.imageCC = image;
    };
    reader.readAsDataURL(file);
  }

  analyze() {
    if (!this.imageMLO.file || !this.imageCC.file) {
      this.analysisError = 'Veuillez importer les deux images (MLO et CC) avant l\'analyse.';
      return;
    }
    if (!this.patient.name || !this.patient.age || !this.patient.examDate) {
      this.analysisError = 'Veuillez remplir tous les champs patients obligatoires.';
      return;
    }

    this.analysisError = '';
    this.isAnalyzing = true;

    const formData = new FormData();
    formData.append('mlo_image',  this.imageMLO.file);
    formData.append('cc_image',   this.imageCC.file);
    formData.append('name',       this.patient.name);
    formData.append('age',        String(this.patient.age));
    formData.append('examDate',   this.patient.examDate);

    this.http.post<any>(`${this.apiBaseUrl}/analyze`, formData).subscribe({
      next: (response) => {
        this.isAnalyzing = false;

        /*
         * Le backend Flask retourne :
         * {
         *   patient: { name, age, examDate },
         *   birads: "4",           ← BI-RADS global
         *   description: "...",    ← texte de description global
         *   warning: "...",
         *   details: {
         *     qwen_birads, gemini_birads,
         *     classifier_mlo, classifier_cc,
         *     detections, override_reason
         *   },
         *   rawWorkflowResult: {...}
         * }
         *
         * On construit les données MLO/CC depuis details quand dispo,
         * sinon on utilise le BI-RADS et la description globaux.
         */

        const biradsGlobal  = response?.birads      ?? 'N/A';
        const descGlobal    = response?.description  ?? '';
        const details       = response?.details      ?? {};

        // BI-RADS par vue (classifiers retournent souvent un chiffre brut)
        const biraMLO = details?.classifier_mlo  ?? biradsGlobal;
        const biraCC  = details?.classifier_cc   ?? biradsGlobal;

        // Rapport textuel par vue : on utilise la description globale si
        // le backend ne renvoie pas de rapport séparé par vue.
        const reportMLO = descGlobal;
        const reportCC  = descGlobal;

        this.router.navigate(['/report'], {
          state: {
            patient:     { ...this.patient },
            globalBirads: biradsGlobal,
            description:  descGlobal,
            warning:      response?.warning ?? '',

            imageMLO: {
              ...this.imageMLO,
              birads:      String(biraMLO),
              report:      reportMLO,
              description: descGlobal,
              localization: details?.override_reason ?? ''
            },
            imageCC: {
              ...this.imageCC,
              birads:      String(biraCC),
              report:      reportCC,
              description: descGlobal,
              localization: details?.override_reason ?? ''
            },

            // On transmet les détails bruts pour affichage optionnel
            details
          }
        });
      },

      error: (error) => {
        this.isAnalyzing = false;
        this.analysisError =
          error?.error?.error ?? 'Erreur serveur pendant l\'analyse. Vérifiez que le backend est démarré sur le port 5000.';
      }
    });
  }

  reset() {
    this.patient    = { name: '', age: null, examDate: '' };
    this.imageMLO   = { preview: null, filename: '', birads: '', report: '', description: '' };
    this.imageCC    = { preview: null, filename: '', birads: '', report: '', description: '' };
    this.analysisError = '';
    this.isAnalyzing   = false;
  }
}