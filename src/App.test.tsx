import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './store/ledgerStore';

async function addPerson(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(screen.getByLabelText('Name'), name);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

describe('App', () => {
  it('asks for at least two people before adding expenses', () => {
    render(<App />);
    expect(screen.getByText(/add at least two people, then you can add a bill/i)).toBeInTheDocument();
  });

  it('splits an expense and shows who pays whom', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addPerson(user, 'Ana');
    await addPerson(user, 'Beto');
    await addPerson(user, 'Caro');

    await user.type(screen.getByLabelText('What was it for?'), 'Dinner');
    await user.type(screen.getByLabelText('Amount'), '30');
    await user.selectOptions(screen.getByLabelText('Who paid?'), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Add this bill' }));

    const transfers = within(screen.getByRole('list', { name: 'Who pays whom' }));
    const items = transfers.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toHaveLength(2);
    expect(items.some((t) => /Beto pays Ana\s*\$10[.,]00/.test(t ?? ''))).toBe(true);
    expect(items.some((t) => /Caro pays Ana\s*\$10[.,]00/.test(t ?? ''))).toBe(true);

    const share = screen.getByRole('link', { name: 'Share on WhatsApp' });
    const text = new URL(share.getAttribute('href')!).searchParams.get('text');
    expect(text).toMatch(/Beto → Ana: \*\$10[.,]00\*/);

    const spent = within(screen.getByRole('list', { name: 'What each person spent' }));
    expect(spent.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringMatching(/Ana\$10[.,]00/),
      expect.stringMatching(/Beto\$10[.,]00/),
      expect.stringMatching(/Caro\$10[.,]00/),
    ]);
  });

  it('saves changes to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addPerson(user, 'Ana');
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"name":"Ana"');
  });

  it('rejects duplicate names', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addPerson(user, 'Ana');
    await user.type(screen.getByLabelText('Name'), 'ana');
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('does not accept digits in names', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Name'), 'Ana2');
    expect(screen.getByLabelText('Name')).toHaveValue('Ana');
  });

  it('asks for confirmation before deleting everything', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addPerson(user, 'Ana');

    await user.click(screen.getByRole('button', { name: 'Start over' }));
    const dialog = screen.getByRole('alertdialog', { name: /erase everything/i });
    expect(dialog).toHaveTextContent(/can't undo it/i);

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Ana')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start over' }));
    await user.click(screen.getByRole('button', { name: 'Erase everything' }));
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });

  it('removes people and expenses, but not someone who still has expenses', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addPerson(user, 'Ana');
    await addPerson(user, 'Beto');
    await addPerson(user, 'Caro');

    await user.click(screen.getByRole('button', { name: 'Remove Caro' }));
    expect(screen.queryByText('Caro')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('What was it for?'), 'Pizza');
    await user.type(screen.getByLabelText('Amount'), '10');
    await user.click(screen.getByRole('button', { name: 'Add this bill' }));
    expect(screen.getByRole('button', { name: 'Remove Ana' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Delete Pizza' }));
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Ana' })).toBeEnabled();
  });
});
