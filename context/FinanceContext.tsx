import React, { createContext, useContext, useState } from 'react';

export type Expense = {
  label: string;
  actual: string[];  // actual spending per month
  budget: string[];  // budgeted amount per month
};

export type Income = {
  label: string;
  values: string[];  // per-month income values
};

type FinanceContextType = {
  expenseRows: Expense[];
  setExpenseRows: React.Dispatch<React.SetStateAction<Expense[]>>;
  incomeRows: Income[];
  setIncomeRows: React.Dispatch<React.SetStateAction<Income[]>>;
};

const MONTHS = 12;

// Ensure all monthly arrays are always 12 entries
const normalizeArray = (arr?: string[]) =>
  Array.from({ length: MONTHS }, (_, i) => arr?.[i] ?? '');

const normalizeExpense = (row: Partial<Expense>): Expense => ({
  label: row.label ?? 'Unnamed',
  actual: normalizeArray(row.actual),
  budget: normalizeArray(row.budget),
});

const normalizeIncome = (row: Partial<Income>): Income => ({
  label: row.label ?? 'Unnamed',
  values: normalizeArray(row.values),
});

// 👇 Empty initial data
const defaultExpenses: Expense[] = [];
const defaultIncomes: Income[] = [];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenseRows, setExpenseRows] = useState<Expense[]>(defaultExpenses);
  const [incomeRows, setIncomeRows] = useState<Income[]>(defaultIncomes);

  return (
    <FinanceContext.Provider
      value={{
        expenseRows,
        setExpenseRows,
        incomeRows,
        setIncomeRows,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
};
