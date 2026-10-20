import fs from 'fs';

const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Contents 4 0 R
  /Resources << /Font << /F1 5 0 R >> >>
>>
endobj
4 0 obj
<< /Length 850 >>
stream
BT
/F1 18 Tf
50 780 Td
(APARTAMENTO COSTA DEL SOL SUANCES) Tj
/F1 11 Tf
0 -28 Td
(Guia de Bienvenida, Normas de la Casa y Recomendaciones Locales) Tj
0 -40 Td
(1. NORMAS DE LA CASA) Tj
0 -20 Td
(- Check-in: a partir de las 16:00 h / Check-out: hasta las 11:00 h.) Tj
0 -20 Td
(- Descanso vecinal: Silencio respetuoso a partir de las 23:00 h.) Tj
0 -20 Td
(- Mascotas bienvenidas sin suplemento adicional.) Tj
0 -20 Td
(- Fibra Optica de alta velocidad disponible en toda la vivienda.) Tj
0 -36 Td
(2. PLAYAS Y EXPERIENCIAS EN SUANCES) Tj
0 -20 Td
(- Playa de La Concha: A 2 minutos a pie frente al apartamento.) Tj
0 -20 Td
(- Playa de Los Locos: Paraiso del surf y atardeceres miticos sobre el mar.) Tj
0 -20 Td
(- Ruta de los Acantilados y Faro: Vistas 360 al Cantabrico desde la puerta.) Tj
0 -20 Td
(- Ría de San Martin: Paseos en barco y paddle surf al amanecer.) Tj
0 -36 Td
(3. CONTACTO DIRECTO CON EL ANFITRION) Tj
0 -20 Td
(Ivan Torresano | WhatsApp: +34 600 000 000 | info@costadelsolsuances.es) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000114 00000 n 
0000000250 00000 n 
0000001150 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1225
%%EOF`;

fs.writeFileSync('public/guia-suances.pdf', content);
console.log('PDF generated at public/guia-suances.pdf');

