import type { EnrichedAusruestungsgegenstand, EnrichedAusruestungszuweisung, EnrichedSchnellausgabe } from '@/types/enriched';
import type { Ausruestungsgegenstand, Ausruestungszuweisung, Kategorie, Personal, Schnellausgabe } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface AusruestungszuweisungMaps {
  personalMap: Map<string, Personal>;
  ausruestungsgegenstandMap: Map<string, Ausruestungsgegenstand>;
}

export function enrichAusruestungszuweisung(
  ausruestungszuweisung: Ausruestungszuweisung[],
  maps: AusruestungszuweisungMaps
): EnrichedAusruestungszuweisung[] {
  return ausruestungszuweisung.map(r => ({
    ...r,
    person_refName: resolveDisplay(r.fields.person_ref, maps.personalMap, 'vorname', 'nachname'),
    gegenstand_refName: resolveDisplay(r.fields.gegenstand_ref, maps.ausruestungsgegenstandMap, 'bezeichnung'),
  }));
}

interface SchnellausgabeMaps {
  ausruestungsgegenstandMap: Map<string, Ausruestungsgegenstand>;
  personalMap: Map<string, Personal>;
}

export function enrichSchnellausgabe(
  schnellausgabe: Schnellausgabe[],
  maps: SchnellausgabeMaps
): EnrichedSchnellausgabe[] {
  return schnellausgabe.map(r => ({
    ...r,
    schnell_gegenstaendeName: resolveDisplay(r.fields.schnell_gegenstaende, maps.ausruestungsgegenstandMap, 'bezeichnung'),
    schnell_personName: resolveDisplay(r.fields.schnell_person, maps.personalMap, 'vorname', 'nachname'),
  }));
}

interface AusruestungsgegenstandMaps {
  kategorieMap: Map<string, Kategorie>;
}

export function enrichAusruestungsgegenstand(
  ausruestungsgegenstand: Ausruestungsgegenstand[],
  maps: AusruestungsgegenstandMaps
): EnrichedAusruestungsgegenstand[] {
  return ausruestungsgegenstand.map(r => ({
    ...r,
    kategorie_refName: resolveDisplay(r.fields.kategorie_ref, maps.kategorieMap, 'kategorie_name'),
  }));
}
