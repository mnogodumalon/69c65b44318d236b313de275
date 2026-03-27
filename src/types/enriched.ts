import type { Ausruestungsgegenstand, Ausruestungszuweisung, Schnellausgabe } from './app';

export type EnrichedAusruestungszuweisung = Ausruestungszuweisung & {
  person_refName: string;
  gegenstand_refName: string;
};

export type EnrichedSchnellausgabe = Schnellausgabe & {
  schnell_gegenstaendeName: string;
  schnell_personName: string;
};

export type EnrichedAusruestungsgegenstand = Ausruestungsgegenstand & {
  kategorie_refName: string;
};
