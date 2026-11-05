import { useRef, useState } from 'react';
import { parseLedgerBackup, serializeLedger } from '../lib/backup';
import { groupLink } from '../sharedGroup';
import { useLedgerStore } from '../store/ledgerStore';

export function GroupFile() {
  const load = useLedgerStore((s) => s.load);
  const input = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<number | undefined>(undefined);
  const [problem, setProblem] = useState('');
  const [copied, setCopied] = useState(false);

  function save() {
    const file = new Blob([serializeLedger(useLedgerStore.getState())], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'split-it.json';
    link.click();
    URL.revokeObjectURL(url);
    setProblem('');
  }

  async function open(file: File) {
    const ledger = parseLedgerBackup(await file.text());
    if (!ledger) {
      setProblem('That file is not a Split It group.');
      return;
    }
    load(ledger);
    setProblem('');
  }

  function copyLink() {
    void navigator.clipboard.writeText(groupLink(useLedgerStore.getState())).then(
      () => {
        setCopied(true);
        window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }

  return (
    <div className="file-actions">
      <button type="button" className="ghost" onClick={copyLink}>
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <button type="button" className="ghost" onClick={save}>
        Save a copy
      </button>
      <button type="button" className="ghost" onClick={() => input.current?.click()}>
        Open a saved copy
      </button>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="application/json,.json"
        aria-label="Open a saved copy"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void open(file);
        }}
      />
      {problem && <p className="hint">{problem}</p>}
    </div>
  );
}
