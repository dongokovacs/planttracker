import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import v8toIstanbul from 'v8-to-istanbul';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertCoverage() {
  const coverageDir = path.join(__dirname, '..', 'coverage', 'raw');
  const outputDir = path.join(__dirname, '..', 'coverage', 'istanbul');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(coverageDir).filter(f => f.endsWith('-js.json'));

  const istanbulCoverage = {};

  for (const file of files) {
    const coverageData = JSON.parse(
      fs.readFileSync(path.join(coverageDir, file), 'utf-8')
    );

    for (const entry of coverageData) {
      // Skip non-application files (node_modules, etc.)
      if (entry.url.includes('node_modules') || 
          !entry.url.includes('localhost:4200')) {
        continue;
      }

      // Extract file path from URL
      const urlObj = new URL(entry.url);
      const filePath = path.join(__dirname, '..', urlObj.pathname);

      try {
        // Check if source file exists
        if (!fs.existsSync(filePath)) {
          console.warn(`Source file not found: ${filePath}`);
          continue;
        }

        const converter = v8toIstanbul(filePath);
        await converter.load();
        converter.applyCoverage([
          {
            functionName: '',
            ranges: entry.ranges,
            isBlockCoverage: true,
          },
        ]);

        const istanbulData = converter.toIstanbul();
        Object.assign(istanbulCoverage, istanbulData);
      } catch (error) {
        console.error(`Error converting ${entry.url}:`, error.message);
      }
    }
  }

  // Write Istanbul coverage
  fs.writeFileSync(
    path.join(outputDir, 'coverage-final.json'),
    JSON.stringify(istanbulCoverage, null, 2)
  );

  console.log('✅ Coverage converted to Istanbul format');
  console.log(`📁 Output: ${path.join(outputDir, 'coverage-final.json')}`);
}

convertCoverage().catch(console.error);
