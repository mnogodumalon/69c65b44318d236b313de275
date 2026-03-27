import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichAusruestungszuweisung, enrichAusruestungsgegenstand } from '@/lib/enrich';
import type { EnrichedAusruestungszuweisung, EnrichedAusruestungsgegenstand } from '@/types/enriched';
import type { Ausruestungszuweisung, Ausruestungsgegenstand } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AusruestungsgegenstandDialog } from '@/components/dialogs/AusruestungsgegenstandDialog';
import { AusruestungszuweisungDialog } from '@/components/dialogs/AusruestungszuweisungDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import {
  IconAlertCircle, IconPlus, IconPencil, IconTrash, IconSearch,
  IconShield, IconUsers, IconPackage, IconArrowRight, IconClipboardList,
  IconBox, IconX, IconFilter
} from '@tabler/icons-react';

// Status styling helpers
function getStatusBadge(status: string | undefined) {
  switch (status) {
    case 'ausgegeben': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Ausgegeben</Badge>;
    case 'zurueckgegeben': return <Badge className="bg-green-100 text-green-800 border-green-200">Zurückgegeben</Badge>;
    case 'verloren': return <Badge className="bg-red-100 text-red-800 border-red-200">Verloren</Badge>;
    case 'beschaedigt_zurueckgegeben': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Beschädigt</Badge>;
    default: return <Badge variant="secondary">—</Badge>;
  }
}

function getZustandBadge(zustand: string | undefined) {
  switch (zustand) {
    case 'neu': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Neu</Badge>;
    case 'gut': return <Badge className="bg-green-100 text-green-800 border-green-200">Gut</Badge>;
    case 'gebraucht': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Gebraucht</Badge>;
    case 'beschaedigt': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Beschädigt</Badge>;
    case 'ausser_betrieb': return <Badge className="bg-red-100 text-red-800 border-red-200">Außer Betrieb</Badge>;
    default: return null;
  }
}

export default function DashboardOverview() {
  const {
    ausruestungszuweisung, personal, ausruestungsgegenstand,
    kategorieMap, personalMap, ausruestungsgegenstandMap,
    loading, error, fetchAll,
  } = useDashboardData();

  // State - ALL hooks must be before any early returns
  const [activeTab, setActiveTab] = useState<'equipment' | 'assignments'>('equipment');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zustandFilter, setZustandFilter] = useState<string>('all');
  const [editGegenstand, setEditGegenstand] = useState<EnrichedAusruestungsgegenstand | null>(null);
  const [gegenstandDialogOpen, setGegenstandDialogOpen] = useState(false);
  const [editZuweisung, setEditZuweisung] = useState<EnrichedAusruestungszuweisung | null>(null);
  const [zuweisungDialogOpen, setZuweisungDialogOpen] = useState(false);
  const [deleteGegenstandTarget, setDeleteGegenstandTarget] = useState<EnrichedAusruestungsgegenstand | null>(null);
  const [deleteZuweisungTarget, setDeleteZuweisungTarget] = useState<EnrichedAusruestungszuweisung | null>(null);
  const [selectedGegenstandId, setSelectedGegenstandId] = useState<string | null>(null);

  const enrichedAusruestungszuweisung = enrichAusruestungszuweisung(ausruestungszuweisung, { personalMap, ausruestungsgegenstandMap });
  const enrichedAusruestungsgegenstand = enrichAusruestungsgegenstand(ausruestungsgegenstand, { kategorieMap });

  // Filtered equipment list
  const filteredGegenstand = useMemo(() => {
    return enrichedAusruestungsgegenstand.filter(g => {
      const matchesSearch = !searchQuery ||
        g.fields.bezeichnung?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.fields.seriennummer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.fields.hersteller?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.kategorie_refName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.fields.standort?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZustand = zustandFilter === 'all' || g.fields.zustand?.key === zustandFilter;
      return matchesSearch && matchesZustand;
    });
  }, [enrichedAusruestungsgegenstand, searchQuery, zustandFilter]);

  // Filtered assignments list
  const filteredZuweisung = useMemo(() => {
    return enrichedAusruestungszuweisung.filter(z => {
      const matchesSearch = !searchQuery ||
        z.person_refName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.gegenstand_refName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || z.fields.status_zuweisung?.key === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedAusruestungszuweisung, searchQuery, statusFilter]);

  // Assignments for selected equipment item
  const selectedGegenstandZuweisungen = useMemo(() => {
    if (!selectedGegenstandId) return [];
    return enrichedAusruestungszuweisung.filter(z => {
      if (!z.fields.gegenstand_ref) return false;
      return z.fields.gegenstand_ref.includes(selectedGegenstandId);
    });
  }, [selectedGegenstandId, enrichedAusruestungszuweisung]);

  // KPI calculations
  const totalGegenstand = ausruestungsgegenstand.length;
  const totalPersonal = personal.length;
  const activeAssignments = ausruestungszuweisung.filter(z => z.fields.status_zuweisung?.key === 'ausgegeben').length;
  const damagedItems = ausruestungsgegenstand.filter(g => g.fields.zustand?.key === 'beschaedigt' || g.fields.zustand?.key === 'ausser_betrieb').length;

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const selectedGegenstand = selectedGegenstandId
    ? enrichedAusruestungsgegenstand.find(g => g.record_id === selectedGegenstandId)
    : null;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Ausrüstungsgegenstände"
          value={String(totalGegenstand)}
          description="Einträge gesamt"
          icon={<IconBox size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Personal"
          value={String(totalPersonal)}
          description="Erfasste Personen"
          icon={<IconUsers size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Aktive Ausgaben"
          value={String(activeAssignments)}
          description="Ausgegebene Ausrüstung"
          icon={<IconClipboardList size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Mängel"
          value={String(damagedItems)}
          description="Beschädigt / Außer Betrieb"
          icon={<IconShield size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Main workspace */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left panel: Equipment or Assignments list */}
        <div className={`${selectedGegenstandId ? 'lg:w-1/2' : 'w-full'} transition-all`}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                {/* Tab switcher */}
                <div className="flex gap-1 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => { setActiveTab('equipment'); setSearchQuery(''); setZustandFilter('all'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'equipment'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconPackage size={14} className="shrink-0" />
                      Ausrüstung
                    </span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('assignments'); setSearchQuery(''); setStatusFilter('all'); setSelectedGegenstandId(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'assignments'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconClipboardList size={14} className="shrink-0" />
                      Zuweisungen
                    </span>
                  </button>
                </div>

                {/* Create button */}
                <Button
                  size="sm"
                  onClick={() => {
                    if (activeTab === 'equipment') {
                      setEditGegenstand(null);
                      setGegenstandDialogOpen(true);
                    } else {
                      setEditZuweisung(null);
                      setZuweisungDialogOpen(true);
                    }
                  }}
                >
                  <IconPlus size={16} className="shrink-0 mr-1" />
                  {activeTab === 'equipment' ? 'Gegenstand' : 'Zuweisung'}
                </Button>
              </div>

              {/* Search + filter row */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-40">
                  <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Suchen…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>
                {activeTab === 'equipment' && (
                  <div className="flex items-center gap-1">
                    <IconFilter size={14} className="text-muted-foreground shrink-0" />
                    <select
                      value={zustandFilter}
                      onChange={e => setZustandFilter(e.target.value)}
                      className="h-8 text-sm rounded-md border border-input bg-background px-2 pr-6"
                    >
                      <option value="all">Alle Zustände</option>
                      <option value="neu">Neu</option>
                      <option value="gut">Gut</option>
                      <option value="gebraucht">Gebraucht</option>
                      <option value="beschaedigt">Beschädigt</option>
                      <option value="ausser_betrieb">Außer Betrieb</option>
                    </select>
                  </div>
                )}
                {activeTab === 'assignments' && (
                  <div className="flex items-center gap-1">
                    <IconFilter size={14} className="text-muted-foreground shrink-0" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="h-8 text-sm rounded-md border border-input bg-background px-2 pr-6"
                    >
                      <option value="all">Alle Status</option>
                      <option value="ausgegeben">Ausgegeben</option>
                      <option value="zurueckgegeben">Zurückgegeben</option>
                      <option value="verloren">Verloren</option>
                      <option value="beschaedigt_zurueckgegeben">Beschädigt zurückgegeben</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* List content */}
            <div className="overflow-x-auto">
              {activeTab === 'equipment' ? (
                <EquipmentList
                  items={filteredGegenstand}
                  selectedId={selectedGegenstandId}
                  onSelect={setSelectedGegenstandId}
                  onEdit={(g) => { setEditGegenstand(g); setGegenstandDialogOpen(true); }}
                  onDelete={(g) => setDeleteGegenstandTarget(g)}
                  onAssign={() => {
                    setEditZuweisung(null);
                    setZuweisungDialogOpen(true);
                  }}
                />
              ) : (
                <AssignmentList
                  items={filteredZuweisung}
                  onEdit={(z) => { setEditZuweisung(z); setZuweisungDialogOpen(true); }}
                  onDelete={(z) => setDeleteZuweisungTarget(z)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Detail view for selected equipment */}
        {selectedGegenstandId && selectedGegenstand && (
          <div className="lg:w-1/2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{selectedGegenstand.fields.bezeichnung || '—'}</h3>
                    {getZustandBadge(selectedGegenstand.fields.zustand?.key)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {selectedGegenstand.kategorie_refName || 'Keine Kategorie'}
                    {selectedGegenstand.fields.hersteller && ` · ${selectedGegenstand.fields.hersteller}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGegenstandId(null)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Detail info */}
              <div className="p-4 space-y-3 border-b border-border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedGegenstand.fields.seriennummer && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Seriennummer</span>
                      <span className="font-medium">{selectedGegenstand.fields.seriennummer}</span>
                    </div>
                  )}
                  {selectedGegenstand.fields.menge != null && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Bestand</span>
                      <span className="font-medium">{selectedGegenstand.fields.menge}</span>
                    </div>
                  )}
                  {selectedGegenstand.fields.standort && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Standort</span>
                      <span className="font-medium">{selectedGegenstand.fields.standort}</span>
                    </div>
                  )}
                  {selectedGegenstand.fields.beschaffungsdatum && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Beschaffungsdatum</span>
                      <span className="font-medium">{formatDate(selectedGegenstand.fields.beschaffungsdatum)}</span>
                    </div>
                  )}
                </div>
                {selectedGegenstand.fields.bemerkungen_gegenstand && (
                  <div className="text-sm">
                    <span className="text-muted-foreground block text-xs mb-1">Bemerkungen</span>
                    <p className="text-foreground line-clamp-3">{selectedGegenstand.fields.bemerkungen_gegenstand}</p>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditGegenstand(selectedGegenstand); setGegenstandDialogOpen(true); }}
                  >
                    <IconPencil size={14} className="shrink-0 mr-1" />
                    Bearbeiten
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditZuweisung(null);
                      setZuweisungDialogOpen(true);
                    }}
                  >
                    <IconArrowRight size={14} className="shrink-0 mr-1" />
                    Ausgeben
                  </Button>
                </div>
              </div>

              {/* Assignment history for this item */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Zuweisungen ({selectedGegenstandZuweisungen.length})
                </h4>
                {selectedGegenstandZuweisungen.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Zuweisungen für diesen Gegenstand.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedGegenstandZuweisungen.map(z => (
                      <div key={z.record_id} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-muted/40">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{z.person_refName || '—'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(z.fields.ausgabedatum)}
                            {z.fields.rueckgabedatum && ` → ${formatDate(z.fields.rueckgabedatum)}`}
                            {z.fields.menge_zuweisung != null && ` · ${z.fields.menge_zuweisung} Stk.`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {getStatusBadge(z.fields.status_zuweisung?.key)}
                          <button
                            onClick={() => { setEditZuweisung(z); setZuweisungDialogOpen(true); }}
                            className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                          >
                            <IconPencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteZuweisungTarget(z)}
                            className="p-1 rounded-md hover:bg-destructive/10 text-destructive"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Equipment Dialog */}
      <AusruestungsgegenstandDialog
        open={gegenstandDialogOpen}
        onClose={() => { setGegenstandDialogOpen(false); setEditGegenstand(null); }}
        onSubmit={async (fields: Ausruestungsgegenstand['fields']) => {
          if (editGegenstand) {
            await LivingAppsService.updateAusruestungsgegenstandEntry(editGegenstand.record_id, fields);
          } else {
            await LivingAppsService.createAusruestungsgegenstandEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editGegenstand?.fields}
        kategorieList={[]}
        enablePhotoScan={AI_PHOTO_SCAN['Ausruestungsgegenstand']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Ausruestungsgegenstand']}
      />

      {/* Assignment Dialog */}
      <AusruestungszuweisungDialog
        open={zuweisungDialogOpen}
        onClose={() => { setZuweisungDialogOpen(false); setEditZuweisung(null); }}
        onSubmit={async (fields: Ausruestungszuweisung['fields']) => {
          if (editZuweisung) {
            await LivingAppsService.updateAusruestungszuweisungEntry(editZuweisung.record_id, fields);
          } else {
            if (selectedGegenstandId && !fields.gegenstand_ref) {
              fields = { ...fields, gegenstand_ref: createRecordUrl(APP_IDS.AUSRUESTUNGSGEGENSTAND, selectedGegenstandId) };
            }
            await LivingAppsService.createAusruestungszuweisungEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editZuweisung
          ? editZuweisung.fields
          : selectedGegenstandId
            ? { gegenstand_ref: createRecordUrl(APP_IDS.AUSRUESTUNGSGEGENSTAND, selectedGegenstandId) }
            : undefined
        }
        personalList={personal}
        ausruestungsgegenstandList={ausruestungsgegenstand}
        enablePhotoScan={AI_PHOTO_SCAN['Ausruestungszuweisung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Ausruestungszuweisung']}
      />

      {/* Delete Equipment Confirm */}
      <ConfirmDialog
        open={!!deleteGegenstandTarget}
        title="Gegenstand löschen"
        description={`"${deleteGegenstandTarget?.fields.bezeichnung}" wirklich löschen?`}
        onConfirm={async () => {
          if (!deleteGegenstandTarget) return;
          await LivingAppsService.deleteAusruestungsgegenstandEntry(deleteGegenstandTarget.record_id);
          if (selectedGegenstandId === deleteGegenstandTarget.record_id) setSelectedGegenstandId(null);
          setDeleteGegenstandTarget(null);
          fetchAll();
        }}
        onClose={() => setDeleteGegenstandTarget(null)}
      />

      {/* Delete Assignment Confirm */}
      <ConfirmDialog
        open={!!deleteZuweisungTarget}
        title="Zuweisung löschen"
        description={`Zuweisung für "${deleteZuweisungTarget?.person_refName}" wirklich löschen?`}
        onConfirm={async () => {
          if (!deleteZuweisungTarget) return;
          await LivingAppsService.deleteAusruestungszuweisungEntry(deleteZuweisungTarget.record_id);
          setDeleteZuweisungTarget(null);
          fetchAll();
        }}
        onClose={() => setDeleteZuweisungTarget(null)}
      />
    </div>
  );
}

// Equipment list component
function EquipmentList({
  items,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: EnrichedAusruestungsgegenstand[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (item: EnrichedAusruestungsgegenstand) => void;
  onDelete: (item: EnrichedAusruestungsgegenstand) => void;
  onAssign: (item: EnrichedAusruestungsgegenstand) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <IconBox size={48} stroke={1.5} className="text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Keine Gegenstände gefunden</p>
          <p className="text-sm text-muted-foreground">Erstellen Sie Ihren ersten Ausrüstungsgegenstand.</p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Bezeichnung</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">Kategorie</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Zustand</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden lg:table-cell">Bestand</th>
          <th className="px-4 py-2.5 text-xs"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {items.map(item => (
          <tr
            key={item.record_id}
            onClick={() => onSelect(selectedId === item.record_id ? null : item.record_id)}
            className={`cursor-pointer transition-colors ${
              selectedId === item.record_id
                ? 'bg-primary/5 hover:bg-primary/10'
                : 'hover:bg-muted/30'
            }`}
          >
            <td className="px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium truncate max-w-48">{item.fields.bezeichnung || '—'}</p>
                {item.fields.seriennummer && (
                  <p className="text-xs text-muted-foreground truncate">{item.fields.seriennummer}</p>
                )}
              </div>
            </td>
            <td className="px-4 py-3 hidden md:table-cell">
              <span className="text-muted-foreground truncate max-w-32 block">{item.kategorie_refName || '—'}</span>
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
              {getZustandBadge(item.fields.zustand?.key)}
            </td>
            <td className="px-4 py-3 hidden lg:table-cell">
              <span className="text-muted-foreground">{item.fields.menge ?? '—'}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={e => { e.stopPropagation(); onEdit(item); }}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                  title="Bearbeiten"
                >
                  <IconPencil size={15} className="shrink-0" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(item); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                  title="Löschen"
                >
                  <IconTrash size={15} className="shrink-0" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Assignment list component
function AssignmentList({
  items,
  onEdit,
  onDelete,
}: {
  items: EnrichedAusruestungszuweisung[];
  onEdit: (item: EnrichedAusruestungszuweisung) => void;
  onDelete: (item: EnrichedAusruestungszuweisung) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <IconClipboardList size={48} stroke={1.5} className="text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Keine Zuweisungen gefunden</p>
          <p className="text-sm text-muted-foreground">Erstellen Sie Ihre erste Ausrüstungszuweisung.</p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Person</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Gegenstand</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">Ausgabedatum</th>
          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
          <th className="px-4 py-2.5 text-xs"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {items.map(item => (
          <tr key={item.record_id} className="hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium truncate max-w-40">{item.person_refName || '—'}</p>
                {item.fields.menge_zuweisung != null && (
                  <p className="text-xs text-muted-foreground">{item.fields.menge_zuweisung} Stk.</p>
                )}
              </div>
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
              <span className="text-muted-foreground truncate max-w-36 block">{item.gegenstand_refName || '—'}</span>
            </td>
            <td className="px-4 py-3 hidden md:table-cell">
              <div className="text-muted-foreground">
                <span>{formatDate(item.fields.ausgabedatum)}</span>
                {item.fields.rueckgabedatum && (
                  <span className="text-xs block">→ {formatDate(item.fields.rueckgabedatum)}</span>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              {getStatusBadge(item.fields.status_zuweisung?.key)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                  title="Bearbeiten"
                >
                  <IconPencil size={15} className="shrink-0" />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                  title="Löschen"
                >
                  <IconTrash size={15} className="shrink-0" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
