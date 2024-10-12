import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Sørg for at importere din Firestore instans

// Opretter en ny chat mellem to brugere
const createNewChat = async (user1Id, user2Id) => {
    const chatId = user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
    const chatRef = doc(db, 'chats', chatId);
  
    try {
      const chatDoc = await getDoc(chatRef);
  
      if (!chatDoc.exists()) {
        const user1Doc = await getDoc(doc(db, 'users', user1Id));
        const user2Doc = await getDoc(doc(db, 'users', user2Id));
  
        const user1Data = user1Doc.exists() ? user1Doc.data() : { name: 'Unknown User', profilePicture: '' };
        const user2Data = user2Doc.exists() ? user2Doc.data() : { name: 'Unknown User', profilePicture: '' };
  
        // Opretter et nyt chatdokument
        await setDoc(chatRef, {
          participants: [user1Id, user2Id],
          participantsInfo: [
            { id: user1Id, name: user1Data.name || 'Unknown User', profilePicture: user1Data.profilePicture || '' },
            { id: user2Id, name: user2Data.name || 'Unknown User', profilePicture: user2Data.profilePicture || '' },
          ],
          lastMessage: '',
          createdAt: new Date(),
        }, { merge: true });
  
        console.log('Chat dokument oprettet korrekt:', (await getDoc(chatRef)).data());
      } else {
        console.log('Chat dokument findes allerede.');
      }
    } catch (error) {
      console.error('Fejl ved oprettelse af chat:', error);
    }
  };
  

// Opdaterer deltageroplysninger i chatten, når en bruger ændrer sin profil
const updateChatParticipantsInfo = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedParticipantsInfo = chatData.participantsInfo.map(participant =>
          participant.id === userId
            ? { ...participant, name: userData.name, profilePicture: userData.profilePicture }
            : participant
        );

        await updateDoc(chatRef, { participantsInfo: updatedParticipantsInfo });
        console.log(`Deltageroplysninger opdateret for chat ${chatId}`);
      } else {
        console.warn(`Bruger ${userId} blev ikke fundet.`);
      }
    }
  } catch (error) {
    console.error('Fejl ved opdatering af deltagernes oplysninger:', error);
  }
};

export { createNewChat, updateChatParticipantsInfo };
