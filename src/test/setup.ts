import '@testing-library/jest-dom/vitest';

import { EMPTY_LEDGER } from '../lib/ledger';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useLedgerStore } from '../store/ledgerStore';

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

afterEach(() => {
  cleanup();
  useLedgerStore.setState(EMPTY_LEDGER);
  localStorage.clear();
  sessionStorage.clear();
});
