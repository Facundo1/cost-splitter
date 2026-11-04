import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { EMPTY_LEDGER } from '../lib/ledger';
import { useLedgerStore } from '../store/ledgerStore';

// jsdom doesn't implement <dialog> yet: minimal stand-in for showModal/close.
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
});
