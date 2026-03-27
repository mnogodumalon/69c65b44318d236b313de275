import type { Schnellausgabe, Ausruestungsgegenstand, Personal } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPencil } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface SchnellausgabeViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Schnellausgabe | null;
  onEdit: (record: Schnellausgabe) => void;
  ausruestungsgegenstandList: Ausruestungsgegenstand[];
  personalList: Personal[];
}

export function SchnellausgabeViewDialog({ open, onClose, record, onEdit, ausruestungsgegenstandList, personalList }: SchnellausgabeViewDialogProps) {
  function getAusruestungsgegenstandDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return ausruestungsgegenstandList.find(r => r.record_id === id)?.fields.bezeichnung ?? '—';
  }

  function getPersonalDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return personalList.find(r => r.record_id === id)?.fields.nachname ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schnellausgabe anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ausrüstungsgegenstände</Label>
            <p className="text-sm">{getAusruestungsgegenstandDisplayName(record.fields.schnell_gegenstaende)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ausgabedatum</Label>
            <p className="text-sm">{formatDate(record.fields.schnell_ausgabedatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bemerkungen</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.schnell_bemerkungen ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Person</Label>
            <p className="text-sm">{getPersonalDisplayName(record.fields.schnell_person)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}