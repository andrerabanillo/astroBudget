import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFinance } from '../../context/FinanceContext';

const screenWidth = Dimensions.get('window').width;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FinanceTab() {
  const { expenseRows, setExpenseRows, incomeRows, setIncomeRows } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const updateValue = (rows, setRows, rowIndex, value) => {
    const updated = [...rows];
    const field = setRows === setExpenseRows ? 'actual' : 'values';
    if (!updated[rowIndex][field]) updated[rowIndex][field] = Array(12).fill('');
    updated[rowIndex][field][selectedMonth] = value;
    setRows(updated);
  };

  const updateLabel = (rows, setRows, rowIndex, label) => {
    const updated = [...rows];
    updated[rowIndex].label = label;
    setRows(updated);
  };

  const addExpenseRow = () => {
    setExpenseRows(prev => [...prev, { label: '', actual: Array(12).fill(''), budget: Array(12).fill('') }]);
  };

  const addIncomeRow = () => {
    setIncomeRows(prev => [...prev, { label: '', values: Array(12).fill('') }]);
  };

  const deleteRow = (rows, setRows, index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const getMonthTotals = (rows, field) => {
    return rows.reduce((sum, row) => {
      const val = parseFloat(row[field]?.[selectedMonth] ?? '0');
      return sum + (isNaN(val) ? 0 : val);
    }, 0).toFixed(2);
  };

  const getYearTotal = (rows, field) => {
    return rows.reduce((sum, row) =>
      sum + row[field]?.reduce((sub, val) => sub + (parseFloat(val) || 0), 0), 0
    ).toFixed(2);
  };

  const getNetColor = (value) => {
    if (value > 0) return { color: 'lime' };
    if (value < 0) return { color: 'tomato' };
    return { color: 'white' };
  };

  const yearTotal = months.reduce((acc, _, i) => {
    const income = incomeRows.reduce((sum, row) => sum + parseFloat(row.values?.[i] || '0'), 0);
    const expense = expenseRows.reduce((sum, row) => sum + parseFloat(row.actual?.[i] || '0'), 0);
    return acc + (income - expense);
  }, 0);

  const expenseData = months.map((_, i) =>
    expenseRows.reduce((sum, row) => sum + parseFloat(row.actual?.[i] || '0'), 0)
  );

  const incomeData = months.map((_, i) =>
    incomeRows.reduce((sum, row) => sum + parseFloat(row.values?.[i] || '0'), 0)
  );

  const netData = months.map((_, i) => incomeData[i] - expenseData[i]);

  const renderTable = (title, rows, setRows, onAdd, isExpense) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.greyBox}>
        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.addButton}>➕ Add Row to {title}</Text>
        </TouchableOpacity>
        {rows.map((row, rowIndex) => {
          const values = isExpense ? row.actual : row.values;
          const thisVal = values?.[selectedMonth] ?? '';
          return (
            <View key={rowIndex} style={styles.row}>
              <TextInput
                value={row.label}
                onChangeText={(text) => updateLabel(rows, setRows, rowIndex, text)}
                style={[styles.cell, styles.inputCell, { flex: 2 }]}
                placeholder="Label"
                placeholderTextColor="#888"
              />
              <TextInput
                value={thisVal}
                keyboardType="numeric"
                onChangeText={(text) => updateValue(rows, setRows, rowIndex, text)}
                style={[styles.cell, styles.inputCell, { flex: 1 }]}
                placeholder="0"
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => deleteRow(rows, setRows, rowIndex)}>
                <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <Text style={styles.totalText}>
          Total {title} for {months[selectedMonth]}: ${getMonthTotals(rows, isExpense ? 'actual' : 'values')}
        </Text>
        <Text style={styles.totalText}>
          Year Total {title}: ${getYearTotal(rows, isExpense ? 'actual' : 'values')}
        </Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/stars.png')}
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBar}>
            <Text style={styles.title}>Finances</Text>
          </View>

          <View style={styles.monthBoxWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.monthBox}>
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
              </View>
            </ScrollView>
          </View>

          {renderTable('Expenses', expenseRows, setExpenseRows, addExpenseRow, true)}
          {renderTable('Income', incomeRows, setIncomeRows, addIncomeRow, false)}

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Income vs Expenses</Text>
            <LineChart
              data={{
                labels: months,
                datasets: [
                  {
                    data: expenseData,
                    color: () => '#ff8c8c',
                    strokeWidth: 2,
                  },
                  {
                    data: incomeData,
                    color: () => '#00cfff',
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth}
              height={240}
              withDots={false}
              withVerticalLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundColor: '#000',
                backgroundGradientFrom: '#000',
                backgroundGradientTo: '#000',
                decimalPlaces: 2,
                color: () => '#fff',
                labelColor: () => '#ccc',
                fillShadowGradientOpacity: 0.15,
                propsForBackgroundLines: {
                  stroke: '#333',
                },
                propsForLabels: {
                  fontSize: 10,
                  dx: -40,
                },
              }}
              bezier
              style={{
                borderRadius: 10,
                marginLeft: 0,
                paddingLeft: 40,
              }}
            />
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#ff8c8c' }]} />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#00cfff' }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
            </View>
          </View>

          <View style={styles.greyBox}>
            <Text style={styles.sectionHeader}>💰 Net (Income - Expenses)</Text>
            {months.map((m, i) => {
              const net = netData[i];
              return (
                <Text key={i} style={[{ marginBottom: 4 }, getNetColor(net)]}>
                  {m}: ${net.toFixed(2)}
                </Text>
              );
            })}
            <Text style={[{ marginTop: 10, fontWeight: 'bold' }, getNetColor(yearTotal)]}>
              Year Total Net Income: ${yearTotal.toFixed(2)}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerBar: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#fff',
  },
  monthBoxWrapper: {
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  monthBox: {
    flexDirection: 'row',
    backgroundColor: '#00cfff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMonthButton: { backgroundColor: '#007AFF' },
  monthText: { color: '#000', fontWeight: 'bold' },
  selectedMonthText: { color: '#fff' },
  section: { marginBottom: 30 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginLeft: 15,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginHorizontal: 15 },
  cell: { borderWidth: 1, borderColor: '#555', padding: 6, marginRight: 6, textAlign: 'center', color: '#fff' },
  inputCell: { backgroundColor: '#1c1c1e', color: '#fff' },
  totalText: { fontWeight: 'bold', marginVertical: 10, color: '#fff', marginLeft: 15 },
  addButton: {
    color: '#00cfff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 5,
  },
  greyBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 0,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#000',
    borderRadius: 10,
    marginHorizontal: 0,
    marginBottom: 30,
    paddingTop: 10,
  },
  chartTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#fff',
    fontSize: 14,
  },
});
