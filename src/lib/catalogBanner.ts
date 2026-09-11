import prisma from './prisma';
import fs from 'fs';
import path from 'path';
import { CatalogBannerConfig, defaultCatalogBanner } from './catalogBannerTypes';

export * from './catalogBannerTypes';

const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'catalog-banner.json');

function readFromJsonFile(): CatalogBannerConfig | null {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading catalog-banner.json:', e);
  }
  return null;
}

function writeToJsonFile(data: CatalogBannerConfig) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing catalog-banner.json:', e);
  }
}

export async function getCatalogBanner(): Promise<CatalogBannerConfig> {
  try {
    const section = await prisma.section.findFirst({
      where: { type: 'CATALOG_BANNER' },
    });

    if (section && section.content) {
      const parsed = JSON.parse(section.content);
      return {
        ...defaultCatalogBanner,
        ...parsed,
        title: section.title || parsed.title || defaultCatalogBanner.title,
        subtitle: section.subtitle || parsed.subtitle || defaultCatalogBanner.subtitle,
      };
    }
  } catch (e) {
    console.error('Failed to get catalog banner from db, trying JSON file:', e);
  }

  // Fallback to JSON file
  const fromFile = readFromJsonFile();
  if (fromFile) {
    return { ...defaultCatalogBanner, ...fromFile };
  }

  return defaultCatalogBanner;
}

export async function saveCatalogBanner(data: CatalogBannerConfig): Promise<CatalogBannerConfig> {
  const merged: CatalogBannerConfig = {
    ...defaultCatalogBanner,
    ...data,
  };

  // 1. Save to JSON file for instant file-based persistence
  writeToJsonFile(merged);

  // 2. Save to database
  try {
    const existing = await prisma.section.findFirst({
      where: { type: 'CATALOG_BANNER' },
    });

    if (existing) {
      await prisma.section.update({
        where: { id: existing.id },
        data: {
          title: merged.title,
          subtitle: merged.subtitle,
          content: JSON.stringify(merged),
          isActive: false, // Ensure it's not treated as a homepage section
        },
      });
    } else {
      await prisma.section.create({
        data: {
          type: 'CATALOG_BANNER',
          title: merged.title,
          subtitle: merged.subtitle,
          content: JSON.stringify(merged),
          order: 999,
          isActive: false, // Not on homepage
        },
      });
    }
  } catch (e) {
    console.error('Failed to save catalog banner to db:', e);
  }

  return merged;
}
