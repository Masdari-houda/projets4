import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './app/home/home.component';
import { ImportComponent } from './app/import/import.component';
import { ReportComponent } from './app/report/report.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'import', component: ImportComponent },
      { path: 'report', component: ReportComponent },
      { path: '**', redirectTo: '' }
    ])
  ]
}).catch(err => console.error(err));
