import type { Ausruestungszuweisung, Personal, Ausruestungsgegenstand } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface AusruestungszuweisungViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Ausruestungszuweisung | null;
  onEdit: (record: Ausruestungszuweisung) => void;
  personalList: Personal[];
  ausruestungsgegenstandList: Ausruestungsgegenstand[];
}

export function AusruestungszuweisungViewDialog({ open, onClose, record, onEdit, personalList, ausruestungsgegenstandList }: AusruestungszuweisungViewDialogProps) {
  function getPersonalDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return personalList.find(r => r.record_id === id)?.fields.nachname ?? '—';
  }

  function getAusruestungsgegenstandDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return ausruestungsgegenstandList.find(r => r.record_id === id)?.fields.bezeichnung ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ausrüstungszuweisung anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Person</Label>
            <p className="text-sm">{getPersonalDisplayName(record.fields.person_ref)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ausrüstungsgegenstand</Label>
            <p className="text-sm">{getAusruestungsgegenstandDisplayName(record.fields.gegenstand_ref)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ausgabedatum</Label>
            <p className="text-sm">{formatDate(record.fields.ausgabedatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rückgabedatum (geplant)</Label>
            <p className="text-sm">{formatDate(record.fields.rueckgabedatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Menge</Label>
            <p className="text-sm">{record.fields.menge_zuweisung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Badge variant="secondary">{record.fields.status_zuweisung?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bemerkungen</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.bemerkungen_zuweisung ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}