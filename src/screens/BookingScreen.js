import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';


const BookingScreen = ({ route, navigation }) => {
  const { trainerId, trainerName } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const allTimeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  ];

  // Hent bookede tider fra Firestore for den valgte dato
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!selectedDate) return;

      try {
        const trainerRef = doc(db, 'trainers', trainerId);
        const trainerSnap = await getDoc(trainerRef);

        if (trainerSnap.exists()) {
          const data = trainerSnap.data();
          const booked = data.bookings?.[selectedDate] || [];
          
          // Opdater tilgængelige tider ved at fjerne bookede tider
          const updatedSlots = allTimeSlots.filter((time) => !booked.includes(time));
          setAvailableTimeSlots(updatedSlots);
        } else {
          setAvailableTimeSlots(allTimeSlots); // Hvis ingen bookinger findes
        }
      } catch (error) {
        console.error('Error fetching booked times:', error);
      }
    };

    fetchBookedTimes();
  }, [selectedDate]);

  const handleBookingConfirmation = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time.');
      return;
    }
  
    try {
      const trainerRef = doc(db, 'trainers', trainerId);
      const trainerSnap = await getDoc(trainerRef);
  
      let updatedBookings = {};
  
      if (trainerSnap.exists()) {
        const data = trainerSnap.data();
        updatedBookings = data.bookings || {};
      }
  
      // Tilføj den nye tid til den valgte dato
      const bookedForDate = updatedBookings[selectedDate] || [];
      if (bookedForDate.includes(selectedTime)) {
        Alert.alert('Error', 'This time slot is already booked.');
        return;
      }
  
      bookedForDate.push(selectedTime);
      updatedBookings[selectedDate] = bookedForDate;
  
      // Brug setDoc med merge: true for at oprette/opdatere dokumentet
      await setDoc(trainerRef, { bookings: updatedBookings }, { merge: true });
  
      Alert.alert('Success', `You booked ${trainerName} on ${selectedDate} at ${selectedTime}`);
      setAvailableTimeSlots((prev) => prev.filter((time) => time !== selectedTime));
      setSelectedTime(null);
    } catch (error) {
      console.error('Error booking time:', error);
      Alert.alert('Error', 'Failed to book time. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEW BOOKING</Text>

      {/* Kalenderkomponent */}
      <View style={styles.calendarContainer}>
        <Text style={styles.subTitle}>Select an appointment time</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: '#3399ff' } }}
          theme={{
            todayTextColor: '#3399ff',
            arrowColor: '#3399ff',
          }}
        />
      </View>

      {/* Tidsvalg */}
      {selectedDate ? (
        <>
          <Text style={styles.subTitle}>Available times</Text>
          <FlatList
            data={availableTimeSlots}
            keyExtractor={(item) => item}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  selectedTime === item && styles.selectedTimeSlot,
                ]}
                onPress={() => setSelectedTime(item)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === item && styles.selectedTimeSlotText,
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <Text style={styles.hintText}>Please select a date first</Text>
      )}

      {/* Book knap */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookingConfirmation}>
        <Text style={styles.bookButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3399ff', paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  calendarContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  timeSlot: { backgroundColor: '#e0f2ff', padding: 10, margin: 5, borderRadius: 5, flex: 1, alignItems: 'center' },
  selectedTimeSlot: { backgroundColor: '#3399ff' },
  timeSlotText: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  selectedTimeSlotText: { color: '#fff' },
  hintText: { textAlign: 'center', color: '#fff', fontSize: 16, marginTop: 10 },
  bookButton: { backgroundColor: '#0046a3', paddingVertical: 15, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default BookingScreen;
