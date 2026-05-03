
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientData {
  name: string;
  age: number | null;
  examDate: string;
}

export interface AnalysisResult {
  patient: PatientData;
  imageMLO: {
    filename: string;
    birads: string;
    report: string;
    description: string;
    localization?: string;
  };
  imageCC: {
    filename: string;
    birads: string;
    report: string;
    description: string;
    localization?: string;
  };
  globalBirads: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  // URL de votre backend Flask
  private readonly API_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  analyze(
    mloFile: File,
    ccFile: File,
    patient: PatientData
  ): Observable<AnalysisResult> {
    const formData = new FormData();

    // Images
    formData.append('mlo_image', mloFile, mloFile.name);
    formData.append('cc_image', ccFile, ccFile.name);

    // Données patient
    formData.append('name', patient.name);
    formData.append('age', String(patient.age));
    formData.append('exam_date', patient.examDate);

    return this.http.post<AnalysisResult>(
      `${this.API_URL}/api/analyze`,
      formData
    );
  }
}
