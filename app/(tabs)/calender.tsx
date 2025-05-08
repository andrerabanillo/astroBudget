import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

type Recurrence = 'None' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Annually';

type Event = {
  title: string;
  date: string;
  recurrence: Recurrence;
};

export default function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventRecurrence, setNewEventRecurrence] = useState<Recurrence>('None');
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setNewEventTitle('');
    setNewEventRecurrence('None');
    setSelectedEventIndex(null);
    setModalVisible(true);
  };

  const addEvent = () => {
    const baseEvent: Event = {
      title: newEventTitle,
      date: selectedDate,
      recurrence: newEventRecurrence,
    };

    const newEvents: Event[] = [baseEvent];

    const addRecurrences = (intervalDays: number, maxCount = 12) => {
      let date = dayjs(selectedDate);
      for (let i = 1; i < maxCount; i++) {
        date = date.add(intervalDays, 'day');
        newEvents.push({ ...baseEvent, date: date.format('YYYY-MM-DD') });
      }
    };

    switch (newEventRecurrence) {
      case 'Weekly': addRecurrences(7); break;
      case 'Biweekly': addRecurrences(14); break;
      case 'Monthly':
        for (let i = 1; i < 12; i++) {
          const date = dayjs(selectedDate).add(i, 'month').format('YYYY-MM-DD');
          newEvents.push({ ...baseEvent, date });
        }
        break;
      case 'Annually':
        for (let i = 1; i <= 3; i++) {
          const date = dayjs(selectedDate).add(i, 'year').format('YYYY-MM-DD');
          newEvents.push({ ...baseEvent, date });
        }
        break;
    }

    setEvents(prev => [...prev, ...newEvents]);
    setModalVisible(false);
  };

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      customStyles: {
        container: {
          borderColor: '#007AFF',
          borderWidth: 1,
          borderRadius: 10,
        },
        text: {
          color: '#fff',
        },
      },
    };
    return acc;
  }, {} as any);

  const sortedEvents = [...events].sort(
    (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.title}>📅 Calendar</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="custom"
        theme={{
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#007AFF',
          todayTextColor: '#007AFF',
        }}
        style={styles.calendar}
      />

      <View style={styles.eventList}>
        <Text style={styles.eventTitle}>📌 Upcoming Events</Text>
        <ScrollView style={styles.scrollArea}>
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setNewEventTitle(event.title);
                  setNewEventRecurrence(event.recurrence);
                  setSelectedDate(event.date);
                  setSelectedEventIndex(
                    events.findIndex(
                      e =>
                        e.date === event.date &&
                        e.title === event.title &&
                        e.recurrence === event.recurrence
                    )
                  );
                  setModalVisible(true);
                }}
              >
                <Text style={styles.eventItem}>
                  {dayjs(event.date).format('MMM D, YYYY')} — {event.title} ({event.recurrence})
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No events found</Text>
          )}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {selectedEventIndex !== null ? 'Edit Event' : 'Add Event'}
            </Text>
            <TextInput
              placeholder="Event Title"
              style={styles.input}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            <Text style={styles.inputLabel}>Recurrence</Text>
            <View style={styles.recurrenceButtons}>
              {['None', 'Weekly', 'Biweekly', 'Monthly', 'Annually'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.recurrenceButton,
                    newEventRecurrence === option && styles.recurrenceSelected,
                  ]}
                  onPress={() => setNewEventRecurrence(option as Recurrence)}
                >
                  <Text style={{ color: newEventRecurrence === option ? 'white' : 'black' }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={selectedEventIndex !== null ? 'Save Changes' : 'Add Event'}
              onPress={() => {
                if (selectedEventIndex !== null) {
                  const updated = [...events];
                  updated[selectedEventIndex] = {
                    ...updated[selectedEventIndex],
                    title: newEventTitle,
                    recurrence: newEventRecurrence,
                  };
                  setEvents(updated);
                } else {
                  addEvent();
                }
                setModalVisible(false);
              }}
            />
            {selectedEventIndex !== null && (
              <Button
                title="Delete Event"
                color="red"
                onPress={() => {
                  const updated = events.filter((_, i) => i !== selectedEventIndex);
                  setEvents(updated);
                  setModalVisible(false);
                  setSelectedEventIndex(null);
                }}
              />
            )}
            <Button
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                setSelectedEventIndex(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  calendar: {
    borderBottomWidth: 1,
    borderColor: '#007AFF',
  },
  eventList: {
    padding: 20,
  },
  scrollArea: {
    maxHeight: 250,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  eventItem: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  modalCard: {
    backgroundColor: '#fff',
    margin: 30,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 5,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 5,
  },
  recurrenceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  recurrenceButton: {
    padding: 10,
    borderRadius: 6,
    borderColor: '#aaa',
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  recurrenceSelected: {
    backgroundColor: '#007AFF',
  },
});
