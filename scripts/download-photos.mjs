import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const targetDir = path.join(projectRoot, 'public', 'images', 'apartamento');

const BOOKING_URL = 'https://www.booking.com/hotel/es/apartamento-costa-del-sol-en-suances.es.html';

const semanticNames = [
  'hero-vistas.jpg',
  'salon-1.jpg',
  'salon-2.jpg',
  'dormitorio-principal.jpg',
  'dormitorio-2.jpg',
  'dormitorio-3.jpg',
  'cocina.jpg',
  'bano.jpg',
  'terraza-vistas.jpg',
  'comedor.jpg',
  'edificio-exterior.jpg',
  'entorno-playa.jpg'
];

async function main() {
  console.log(`[PASO 1.1] Creando carpeta destino: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`[PASO 1.2] Conectando a Booking.com: ${BOOKING_URL}`);
  const res = await fetch(BOOKING_URL, {
    headers: {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  console.log(`✓ HTML recibido correctamente (${(html.length / 1024).toFixed(1)} KB)`);

  // Extraer todas las URLs de cf.bstatic.com
  const matches = [...html.matchAll(/https?:\/\/[^\s"'<>\\]*cf\.bstatic\.com\/xdata\/images\/hotel\/[^\s"'<>\\]+\.jpg[^\s"'<>\\]*/gi)].map(m => m[0]);
  console.log(`Coincidencias encontradas: ${matches.length}`);

  const photoMap = new Map();

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl.replace(/\\u0026/g, '&').replace(/["'<>]/g, '');
    const idMatch = cleanUrl.match(/\/(\d+)\.jpg/i);
    if (!idMatch) continue;
    const photoId = idMatch[1];

    if (!photoMap.has(photoId)) {
      // Reemplazar resolución por max1280x900 para máxima calidad sin marcas de agua
      const hdUrl = cleanUrl.replace(/\/hotel\/[^\/]+\//, '/hotel/max1280x900/');
      photoMap.set(photoId, hdUrl);
    }
  }

  const uniquePhotos = Array.from(photoMap.entries());
  console.log(`✓ Fotos únicas de Booking identificadas: ${uniquePhotos.length}`);

  if (uniquePhotos.length < 5) {
    throw new Error(`Se encontraron solo ${uniquePhotos.length} fotos, esperado al menos 8-12.`);
  }

  console.log(`\n[PASO 1.3] Descargando las 12 fotografías en calidad max1280x900...`);
  const downloaded = [];

  for (let i = 0; i < Math.min(12, uniquePhotos.length); i++) {
    const [photoId, hdUrl] = uniquePhotos[i];
    const fileName = semanticNames[i] || `foto-${i + 1}.jpg`;
    const destPath = path.join(targetDir, fileName);

    console.log(`-> Descargando [${i + 1}/12] ${fileName} (Booking ID: ${photoId})`);
    
    const imgRes = await fetch(hdUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.booking.com/'
      }
    });

    if (!imgRes.ok) {
      console.warn(`⚠️ Error HTTP ${imgRes.status} al descargar ${fileName}`);
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`   ✓ Guardado: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
    downloaded.push({ fileName, size: buffer.length });
  }

  console.log('\n=========================================');
  console.log(`🎉 DESCARGA COMPLETADA CON ÉXITO: ${downloaded.length} fotos HD`);
  console.log('=========================================');
  for (const d of downloaded) {
    console.log(`- public/images/apartamento/${d.fileName} (${(d.size / 1024).toFixed(1)} KB)`);
  }
}

main().catch(err => {
  console.error('Error fatal al descargar fotos:', err);
  process.exit(1);
});
