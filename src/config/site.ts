/**
 * Configuración centralizada de marca, contacto y firma de autor
 * Permite configuración directa en este archivo o mediante variables de entorno en .env / Vercel
 */
const phoneRaw =
  (typeof process !== 'undefined' && process.env?.PUBLIC_WHATSAPP_PHONE) ||
  '34635851390';
const cleanPhone = phoneRaw.replace(/[^0-9]/g, '');

const prefilledMessage = encodeURIComponent(
  'Hola Iván, estoy interesado en el Apartamento Costa del Sol Suances. ¿Me puedes confirmar disponibilidad?'
);

export const SITE_CONFIG = {
  // 📱 Teléfono de WhatsApp para reservas directas (Modificar aquí o mediante PUBLIC_WHATSAPP_PHONE en .env)
  whatsappPhone: cleanPhone,
  whatsappDisplayPhone:
    (typeof process !== 'undefined' && process.env?.PUBLIC_DISPLAY_PHONE) ||
    '+34 635 851 390',

  // Enlace directo de WhatsApp con mensaje inteligente prefijado
  whatsappUrl: `https://wa.me/${cleanPhone}?text=${prefilledMessage}`,

  // Identidad de diseño (unificada con House Manager y Ramia Studio)
  designerName: 'Iván Torresano',
  designerUrl: 'https://github.com/itorresano12',

  // Datos del anfitrión y alojamiento
  hostName:
    (typeof process !== 'undefined' && process.env?.HOST_NAME) || 'Iván Torresano',
  hostEmail:
    (typeof process !== 'undefined' && process.env?.HOST_EMAIL) ||
    'info@apartamentocostadelsol.com',
  apartmentName: 'Apartamento Costa del Sol Suances',
  touristLicense:
    (typeof process !== 'undefined' && process.env?.PUBLIC_TOURIST_LICENSE) ||
    '[Tu Número de Licencia VUT]',

  // Metadatos SEO optimizados (Title <= 60 caracteres, Description 150-160 caracteres)
  defaultTitle: 'Apartamento Costa del Sol Suances | Playa de La Concha',
  defaultDescription:
    'Apartamento turístico frente a la Playa de La Concha en Suances, Cantabria. 3 dormitorios con vistas al mar, WiFi y reserva directa garantizada sin comisiones.',
};
