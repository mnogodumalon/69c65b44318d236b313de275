// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Kategorie {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategorie_name?: string;
    kategorie_beschreibung?: string;
    klassifizierung?: LookupValue;
  };
}

export interface Ausruestungszuweisung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    person_ref?: string; // applookup -> URL zu 'Personal' Record
    gegenstand_ref?: string; // applookup -> URL zu 'Ausruestungsgegenstand' Record
    ausgabedatum?: string; // Format: YYYY-MM-DD oder ISO String
    rueckgabedatum?: string; // Format: YYYY-MM-DD oder ISO String
    menge_zuweisung?: number;
    status_zuweisung?: LookupValue;
    bemerkungen_zuweisung?: string;
  };
}

export interface Schnellausgabe {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    schnell_gegenstaende?: string;
    schnell_ausgabedatum?: string; // Format: YYYY-MM-DD oder ISO String
    schnell_bemerkungen?: string;
    schnell_person?: string; // applookup -> URL zu 'Personal' Record
  };
}

export interface Personal {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    nachname?: string;
    personalnummer?: string;
    dienstgrad?: LookupValue;
    einheit?: string;
    telefon?: string;
    email_personal?: string;
    vorname?: string;
  };
}

export interface Ausruestungsgegenstand {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    seriennummer?: string;
    kategorie_ref?: string; // applookup -> URL zu 'Kategorie' Record
    hersteller?: string;
    zustand?: LookupValue;
    beschaffungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    menge?: number;
    standort?: string;
    bild?: string;
    bemerkungen_gegenstand?: string;
  };
}

export const APP_IDS = {
  KATEGORIE: '69c65b16fe82a428d43fb894',
  AUSRUESTUNGSZUWEISUNG: '69c65b2396f993e4c6ff48a4',
  SCHNELLAUSGABE: '69c65b245ee3ef9cca99df35',
  PERSONAL: '69c65b218ea1cc71d2246251',
  AUSRUESTUNGSGEGENSTAND: '69c65b20c86c4e830477287a',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  kategorie: {
    klassifizierung: [{ key: "offen", label: "Offen" }, { key: "intern", label: "Intern" }, { key: "vertraulich", label: "Vertraulich" }, { key: "geheim", label: "Geheim" }, { key: "streng_geheim", label: "Streng Geheim" }],
  },
  ausruestungszuweisung: {
    status_zuweisung: [{ key: "zurueckgegeben", label: "Zurückgegeben" }, { key: "verloren", label: "Verloren" }, { key: "beschaedigt_zurueckgegeben", label: "Beschädigt zurückgegeben" }, { key: "ausgegeben", label: "Ausgegeben" }],
  },
  personal: {
    dienstgrad: [{ key: "oberfeldwebel", label: "Oberfeldwebel" }, { key: "hauptfeldwebel", label: "Hauptfeldwebel" }, { key: "soldat", label: "Soldat" }, { key: "gefreiter", label: "Gefreiter" }, { key: "obergefreiter", label: "Obergefreiter" }, { key: "hauptgefreiter", label: "Hauptgefreiter" }, { key: "stabsgefreiter", label: "Stabsgefreiter" }, { key: "unteroffizier", label: "Unteroffizier" }, { key: "stabsunteroffizier", label: "Stabsunteroffizier" }, { key: "feldwebel", label: "Feldwebel" }, { key: "stabsfeldwebel", label: "Stabsfeldwebel" }, { key: "oberstabsfeldwebel", label: "Oberstabsfeldwebel" }, { key: "leutnant", label: "Leutnant" }, { key: "oberleutnant", label: "Oberleutnant" }, { key: "hauptmann", label: "Hauptmann" }, { key: "major", label: "Major" }, { key: "oberstleutnant", label: "Oberstleutnant" }, { key: "oberst", label: "Oberst" }, { key: "zivilangestellter", label: "Zivilangestellter" }],
  },
  ausruestungsgegenstand: {
    zustand: [{ key: "neu", label: "Neu" }, { key: "gut", label: "Gut" }, { key: "gebraucht", label: "Gebraucht" }, { key: "beschaedigt", label: "Beschädigt" }, { key: "ausser_betrieb", label: "Außer Betrieb" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'kategorie': {
    'kategorie_name': 'string/text',
    'kategorie_beschreibung': 'string/textarea',
    'klassifizierung': 'lookup/select',
  },
  'ausruestungszuweisung': {
    'person_ref': 'applookup/select',
    'gegenstand_ref': 'applookup/select',
    'ausgabedatum': 'date/date',
    'rueckgabedatum': 'date/date',
    'menge_zuweisung': 'number',
    'status_zuweisung': 'lookup/select',
    'bemerkungen_zuweisung': 'string/textarea',
  },
  'schnellausgabe': {
    'schnell_gegenstaende': 'multipleapplookup/select',
    'schnell_ausgabedatum': 'date/date',
    'schnell_bemerkungen': 'string/textarea',
    'schnell_person': 'applookup/select',
  },
  'personal': {
    'nachname': 'string/text',
    'personalnummer': 'string/text',
    'dienstgrad': 'lookup/select',
    'einheit': 'string/text',
    'telefon': 'string/tel',
    'email_personal': 'string/email',
    'vorname': 'string/text',
  },
  'ausruestungsgegenstand': {
    'bezeichnung': 'string/text',
    'seriennummer': 'string/text',
    'kategorie_ref': 'applookup/select',
    'hersteller': 'string/text',
    'zustand': 'lookup/select',
    'beschaffungsdatum': 'date/date',
    'menge': 'number',
    'standort': 'string/text',
    'bild': 'file',
    'bemerkungen_gegenstand': 'string/textarea',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateKategorie = StripLookup<Kategorie['fields']>;
export type CreateAusruestungszuweisung = StripLookup<Ausruestungszuweisung['fields']>;
export type CreateSchnellausgabe = StripLookup<Schnellausgabe['fields']>;
export type CreatePersonal = StripLookup<Personal['fields']>;
export type CreateAusruestungsgegenstand = StripLookup<Ausruestungsgegenstand['fields']>;