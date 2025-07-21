import { addLocale, locale } from 'primereact/api';
import es from 'primelocale/es.json';
import en from 'primelocale/en.json';

// Configuración inicial
export const setupLocales = () => {
  addLocale('es', es);
  addLocale('en', en);
  
  // Establecer idioma por defecto
  locale('es');
};

// Opciones de idioma disponibles
export const languageOptions = [
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'en', name: 'English', flag: 'en' }
];