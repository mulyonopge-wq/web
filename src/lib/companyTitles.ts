import prisma from './prisma';
import fs from 'fs';
import path from 'path';
import { CompanyTitlesConfig, defaultCompanyTitles } from './companyTitlesTypes';

export * from './companyTitlesTypes';

const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'company-titles.json');

function readFromJsonFile(): Partial<CompanyTitlesConfig> | null {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading company-titles.json:', e);
  }
  return null;
}

function writeToJsonFile(data: CompanyTitlesConfig) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing company-titles.json:', e);
  }
}

export async function getCompanyTitles(): Promise<CompanyTitlesConfig> {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { id: 'default' },
    });

    if (profile && profile.advantagesJson) {
      const parsed = JSON.parse(profile.advantagesJson);
      // Check if advantagesJson contains our custom titles object or wrapper
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          ...defaultCompanyTitles,
          ...(parsed.cardTitles || parsed),
        };
      }
    }
  } catch (e) {
    console.error('Failed to get company titles from db, falling back to JSON:', e);
  }

  const fromFile = readFromJsonFile();
  if (fromFile) {
    return { ...defaultCompanyTitles, ...fromFile };
  }

  return defaultCompanyTitles;
}

export async function saveCompanyTitles(data: Partial<CompanyTitlesConfig>): Promise<CompanyTitlesConfig> {
  const merged: CompanyTitlesConfig = {
    ...defaultCompanyTitles,
    ...data,
  };

  // 1. Write to JSON file
  writeToJsonFile(merged);

  // 2. Persist to db
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { id: 'default' },
    });

    let existingAdvantages: any = [];
    if (profile && profile.advantagesJson) {
      try {
        const parsed = JSON.parse(profile.advantagesJson);
        if (Array.isArray(parsed)) {
          existingAdvantages = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          existingAdvantages = parsed.items;
        }
      } catch (e) {
        // ignore
      }
    }

    const payload = {
      ...merged,
      items: existingAdvantages,
    };

    await prisma.companyProfile.upsert({
      where: { id: 'default' },
      update: {
        advantagesJson: JSON.stringify(payload),
      },
      create: {
        id: 'default',
        advantagesJson: JSON.stringify(payload),
      },
    });
  } catch (e) {
    console.error('Failed to save company titles to db:', e);
  }

  return merged;
}
