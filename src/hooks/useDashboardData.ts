import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kategorie, Ausruestungszuweisung, Schnellausgabe, Personal, Ausruestungsgegenstand } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([]);
  const [ausruestungszuweisung, setAusruestungszuweisung] = useState<Ausruestungszuweisung[]>([]);
  const [schnellausgabe, setSchnellausgabe] = useState<Schnellausgabe[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [ausruestungsgegenstand, setAusruestungsgegenstand] = useState<Ausruestungsgegenstand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [kategorieData, ausruestungszuweisungData, schnellausgabeData, personalData, ausruestungsgegenstandData] = await Promise.all([
        LivingAppsService.getKategorie(),
        LivingAppsService.getAusruestungszuweisung(),
        LivingAppsService.getSchnellausgabe(),
        LivingAppsService.getPersonal(),
        LivingAppsService.getAusruestungsgegenstand(),
      ]);
      setKategorie(kategorieData);
      setAusruestungszuweisung(ausruestungszuweisungData);
      setSchnellausgabe(schnellausgabeData);
      setPersonal(personalData);
      setAusruestungsgegenstand(ausruestungsgegenstandData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [kategorieData, ausruestungszuweisungData, schnellausgabeData, personalData, ausruestungsgegenstandData] = await Promise.all([
          LivingAppsService.getKategorie(),
          LivingAppsService.getAusruestungszuweisung(),
          LivingAppsService.getSchnellausgabe(),
          LivingAppsService.getPersonal(),
          LivingAppsService.getAusruestungsgegenstand(),
        ]);
        setKategorie(kategorieData);
        setAusruestungszuweisung(ausruestungszuweisungData);
        setSchnellausgabe(schnellausgabeData);
        setPersonal(personalData);
        setAusruestungsgegenstand(ausruestungsgegenstandData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const kategorieMap = useMemo(() => {
    const m = new Map<string, Kategorie>();
    kategorie.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kategorie]);

  const personalMap = useMemo(() => {
    const m = new Map<string, Personal>();
    personal.forEach(r => m.set(r.record_id, r));
    return m;
  }, [personal]);

  const ausruestungsgegenstandMap = useMemo(() => {
    const m = new Map<string, Ausruestungsgegenstand>();
    ausruestungsgegenstand.forEach(r => m.set(r.record_id, r));
    return m;
  }, [ausruestungsgegenstand]);

  return { kategorie, setKategorie, ausruestungszuweisung, setAusruestungszuweisung, schnellausgabe, setSchnellausgabe, personal, setPersonal, ausruestungsgegenstand, setAusruestungsgegenstand, loading, error, fetchAll, kategorieMap, personalMap, ausruestungsgegenstandMap };
}