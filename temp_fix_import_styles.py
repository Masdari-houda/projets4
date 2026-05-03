from pathlib import Path

path = Path(r'c:/Users/PC/OneDrive - EMI University/Documents/frontend/src/app/import/import.component.ts')
text = path.read_text(encoding='utf-8')
start = text.index('@Component({')
end = text.index('export class ImportComponent')
new_block = """@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
"""
text = text[:start] + new_block + text[end:]
path.write_text(text, encoding='utf-8')
print('updated')
