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
  imageMLO: any = { preview: null, birads: '4A', report: 'Pas de rapport disponible.', description: '', localization: '' };
  imageCC: any = { preview: null, birads: '4A', report: 'Pas de rapport disponible.', description: '', localization: '' };
  globalBirads = '4A';

  constructor(private router: Router) {
    const navState = (this.router.getCurrentNavigation()?.extras.state as any) || history.state;
    if (navState?.patient) this.patient = navState.patient;
    if (navState?.imageMLO) this.imageMLO = navState.imageMLO;
    if (navState?.imageCC) this.imageCC = navState.imageCC;
    if (navState?.globalBirads) this.globalBirads = navState.globalBirads;
  }

  exportReport() {
    const content =
      `Rapport BI-RADS\nPatient: ${this.patient.name}\nÂge: ${this.patient.age} ans\nDate: ${this.patient.examDate}\n\n` +
      `MLO: BI-RADS ${this.imageMLO.birads} - ${this.imageMLO.report}\n` +
      `CC: BI-RADS ${this.imageCC.birads} - ${this.imageCC.report}\n\n` +
      `Conclusion: BI-RADS ${this.globalBirads}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_birads_${String(this.patient.name).replace(/\s/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
