import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useLedgerStore } from '../store/ledgerStore';
import { ExpenseForm } from './ExpenseForm';

const people = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
  { id: 'c', name: 'Caro' },
];

function setup(group = people) {
  useLedgerStore.setState({ people: group, expenses: [] });
  render(<ExpenseForm />);
  return { user: userEvent.setup() };
}

const lastExpense = () => useLedgerStore.getState().expenses.at(-1);

describe('ExpenseForm', () => {
  it('submits the expense in cents, split among everyone by default', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('What was it for?'), ' Pizza ');
    await user.type(screen.getByLabelText('Amount'), '12,50');
    await user.selectOptions(screen.getByLabelText('Who paid?'), 'Beto');
    await user.click(screen.getByRole('button', { name: 'Add this bill' }));

    expect(lastExpense()).toMatchObject({
      description: 'Pizza',
      amountCents: 1250,
      paidBy: 'b',
      splitAmong: ['a', 'b', 'c'],
    });
  });

  it('only splits among checked people', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('What was it for?'), 'Taxi');
    await user.type(screen.getByLabelText('Amount'), '9');
    await user.click(screen.getByLabelText('Caro'));
    await user.click(screen.getByRole('button', { name: 'Add this bill' }));

    expect(lastExpense()).toMatchObject({ splitAmong: ['a', 'b'] });
  });

  it('cannot submit an invalid amount or with nobody to split among', async () => {
    const { user } = setup();
    const submit = screen.getByRole('button', { name: 'Add this bill' });
    await user.type(screen.getByLabelText('What was it for?'), 'Taxi');

    await user.type(screen.getByLabelText('Amount'), 'abc');
    expect(screen.getByLabelText('Amount')).toHaveValue('');

    await user.type(screen.getByLabelText('Amount'), '0');
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-invalid', 'true');

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '10');
    expect(submit).toBeEnabled();

    for (const name of ['Ana', 'Beto', 'Caro']) await user.click(screen.getByLabelText(name));
    expect(submit).toBeDisabled();
  });

  it('ignores letters and a third decimal in the amount', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Amount'), '1a2.3x45');
    expect(screen.getByLabelText('Amount')).toHaveValue('12.34');
  });

  it('asks for at least two people', () => {
    setup(people.slice(0, 1));
    expect(screen.getByText(/at least two people/i)).toBeInTheDocument();
  });
});
