import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Bar } from 'react-native-progress';
import { useFinance } from '../../context/FinanceContext';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BudgetTab() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const { expenseRows, setExpenseRows } = useFinance();

  const updateBudget = (index: number, value: string) => {
    const updated = [...expenseRows];
    if (!updated[index].budget) updated[index].budget = Array(12).fill('');
    updated[index].budget[selectedMonth] = value;
    setExpenseRows(updated);
  };

  const totalSpent = expenseRows.reduce((sum, exp) => {
    const spent = parseFloat(exp.actual?.[selectedMonth] ?? '0');
    return sum + (isNaN(spent) ? 0 : spent);
  }, 0);

  const totalBudget = expenseRows.reduce((sum, exp) => {
    const budgeted = parseFloat(exp.budget?.[selectedMonth] ?? '0');
    return sum + (isNaN(budgeted) ? 0 : budgeted);
  }, 0);

  const difference = totalBudget - totalSpent;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.title}>📘 Budget</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Text style={styles.monthLabel}>Select Month:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.monthButton, selectedMonth === index && styles.selectedMonthButton]}
              onPress={() => setSelectedMonth(index)}
            >
              <Text style={[styles.monthText, selectedMonth === index && styles.selectedMonthText]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {expenseRows.map((expense, index) => {
          const actual = expense.actual ?? Array(12).fill('');
          const budget = expense.budget ?? Array(12).fill('');

          const spent = parseFloat(actual[selectedMonth] ?? '0') || 0;
          const budgeted = parseFloat(budget[selectedMonth] ?? '0') || 0;
          const progress = budgeted > 0 ? spent / budgeted : 0;
          const percentLabel = `${Math.round(progress * 100)}%`;

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.label}>{expense.label}</Text>
              <View style={styles.row}>
                <Text style={styles.inputLabel}>Budget:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={budget[selectedMonth]}
                  onChangeText={(text) => updateBudget(index, text)}
                  placeholder="0"
                  placeholderTextColor="#888"
                />
              </View>

              <Bar
                progress={progress}
                width={null}
                color={progress > 1 ? '#ff6b6b' : '#00ff95'}
                unfilledColor="#333"
                borderWidth={0}
                height={10}
              />
              <Text style={styles.progressLabel}>
                ${spent.toFixed(2)} / ${budgeted.toFixed(2)} ({percentLabel})
              </Text>
            </View>
          );
        })}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>💵 Total Spent: ${totalSpent.toFixed(2)}</Text>
          <Text style={styles.summaryText}>📊 Total Budget: ${totalBudget.toFixed(2)}</Text>
          <Text style={styles.summaryText}>
            {difference >= 0 ? '✅ Under Budget' : '⚠️ Over Budget'}: ${Math.abs(difference).toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBar: {
    backgroundColor: '#003087',
    padding: 16,
    borderRadius: 8,
    margin: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  scrollArea: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  monthScroll: {
    marginBottom: 20,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#222',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMonthButton: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    color: '#ccc',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    width: 70,
    fontWeight: '500',
    color: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#fff',
  },
  progressLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'right',
    color: '#ccc',
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 15,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    color: '#fff',
  },
});
