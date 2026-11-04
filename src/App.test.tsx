import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

async function addPerson(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(screen.getByLabelText('Name'), name);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

describe('App', () => {
  it('asks for at least two people before adding expenses', () => {
    render(<App />);
    expect(screen.getByText(/add at least two people/i)).toBeInTheDocument();
  });

  it('splits an expense and shows who pays whom', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addPerson(user, 'Ana');
    await addPerson(user, 'Beto');
    await addPerson(user, 'Caro');

    await user.type(screen.getByLabelText('What for'), 'Asado');
    await user.type(screen.getByLabelText('Amount'), '30');
    await user.selectOptions(screen.getByLabelText('Paid by'), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Add expense' }));

    const transfers = within(screen.getByRole('list', { name: 'Transfers' }));
    const items = transfers.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toHaveLength(2);
    expect(items.some((t) => /Beto pays Ana\s*\$10[.,]00/.test(t ?? ''))).toBe(true);
    expect(items.some((t) => /Caro pays Ana\s*\$10[.,]00/.test(t ?? ''))).toBe(true);
  });

  it('persists data across reloads', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await addPerson(user, 'Ana');
    unmount();

    render(<App />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('rejects duplicate names', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addPerson(user, 'Ana');
    await user.type(screen.getByLabelText('Name'), 'ana');
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});
