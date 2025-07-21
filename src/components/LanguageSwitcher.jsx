import { useState, useEffect } from 'react';
import { locale } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import { languageOptions } from '../locales/i18n';

export const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('primeLanguage') || 'es';
  });

  useEffect(() => {
    locale(currentLanguage);
    localStorage.setItem('primeLanguage', currentLanguage);
  }, [currentLanguage]);

  return (
    <Dropdown
      value={currentLanguage}
      options={languageOptions}
      onChange={(e) => setCurrentLanguage(e.value)}
      optionLabel="name"
      style={{ width: '120px' }}
    />
  );
};