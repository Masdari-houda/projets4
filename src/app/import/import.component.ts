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
  imageCC: ImageResult = { preview: null, filename: '', birads: '', report: '', description: '' };
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
    if (!this.imageMLO.filename || !this.imageCC.filename || !this.imageMLO.preview || !this.imageCC.preview) {
      this.analysisError = 'Veuillez importer les deux images (MLO et CC) avant l\'analyse.';
      return;
    }
    if (!this.patient.name || !this.patient.age || !this.patient.examDate) {
      this.analysisError = 'Veuillez remplir tous les champs patients obligatoires.';
      return;
    }
    if (!this.imageMLO.file || !this.imageCC.file) {
      this.analysisError = 'Fichiers invalides. Veuillez reimporter MLO et CC.';
      return;
    }

    this.analysisError = '';
    this.isAnalyzing = true;

    const formData = new FormData();
    formData.append('mlo_image', this.imageMLO.file);
    formData.append('cc_image', this.imageCC.file);
    formData.append('name', this.patient.name);
    formData.append('age', String(this.patient.age));
    formData.append('examDate', this.patient.examDate);

    this.http.post<any>(`${this.apiBaseUrl}/analyze`, formData).subscribe({
      next: (response) => {
        this.isAnalyzing = false;
        this.router.navigate(['/report'], {
          state: {
            patient: { ...this.patient },
            imageMLO: { ...this.imageMLO },
            imageCC: { ...this.imageCC },
            globalBirads: response?.globalBirads || 'N/A',
            workflowResult: response?.workflowResult,
          }
        });
      },
      error: (error) => {
        this.isAnalyzing = false;
        this.analysisError = error?.error?.error || 'Erreur serveur pendant l\'analyse Roboflow.';
      }
    });
  }

  reset() {
    this.patient = { name: '', age: null, examDate: '' };
    this.imageMLO = { preview: null, filename: '', birads: '', report: '', description: '' };
    this.imageCC = { preview: null, filename: '', birads: '', report: '', description: '' };
    this.analysisError = '';
  }
}