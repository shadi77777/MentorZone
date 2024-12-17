import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { FontAwesome } from 'react-native-vector-icons';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const CommentComponent = ({ trainerId, comments }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState(comments || []);
  const [userNameMap, setUserNameMap] = useState({}); // Cache til bruger-id og navne

  useEffect(() => {
    const fetchUserNames = async () => {
      const updatedUserMap = { ...userNameMap };
      for (const comment of commentList) {
        if (!updatedUserMap[comment.userId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', comment.userId));
            if (userDoc.exists()) {
              updatedUserMap[comment.userId] = userDoc.data().name || 'Anonymous';
            } else {
              updatedUserMap[comment.userId] = 'Unknown User';
            }
          } catch (error) {
            console.error('Error fetching user name:', error);
            updatedUserMap[comment.userId] = 'Unknown User';
          }
        }
      }
      setUserNameMap(updatedUserMap);
    };

    fetchUserNames();
  }, [commentList]);

  const handleAddComment = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You need to be logged in to comment.');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    const newComment = {
      userId: user.uid,
      comment: commentText,
      timestamp: new Date().toISOString(),
    };

    try {
      const trainerDocRef = doc(db, 'users', trainerId);
      await updateDoc(trainerDocRef, {
        comments: arrayUnion(newComment),
      });

      setCommentList((prev) => [...prev, newComment]);
      setCommentText('');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding comment: ', error);
      Alert.alert('Error', 'Failed to add comment. Try again.');
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Header for Comments Section */}
      <Text style={styles.sectionTitle}>Comments</Text>

      {/* Button to Add Comment */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.addCommentButton}>
        <FontAwesome name="comment" size={18} color="#fff" />
        <Text style={styles.addCommentButtonText}>Add Comment</Text>
      </TouchableOpacity>

      {/* FlatList to display comments */}
      <FlatList
        data={commentList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>
                {userNameMap[item.userId] || 'Loading...'}
              </Text>
              <Text style={styles.commentDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        )}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Comment Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment here..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3399ff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addCommentButtonText: { color: '#fff', marginLeft: 8, fontSize: 16 },
  commentItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 5,
    elevation: 1,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  commentUser: { fontWeight: 'bold', color: '#0046a3' },
  commentDate: { fontSize: 12, color: '#999' },
  commentText: { fontSize: 14, color: '#333' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  submitButton: { backgroundColor: '#3399ff', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
  submitButtonText: { color: '#fff', textAlign: 'center' },
  cancelButton: { backgroundColor: '#e0e0e0', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 },
  cancelButtonText: { textAlign: 'center' },
});

export default CommentComponent;
