import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Sørg for at importere din Firestore instans

/**
 * Opretter en ny chat mellem to brugere, hvis den ikke allerede eksisterer.
 * Chat-ID genereres ved at sammenligne bruger-ID'erne for at få et deterministisk chatnavn.
 * Der oprettes et chatdokument i Firestore med deltagerinformationer.
 * 
 * @param {string} user1Id - ID for den første bruger
 * @param {string} user2Id - ID for den anden bruger
 */
const createNewChat = async (user1Id, user2Id) => {
    // Generér chatId på baggrund af brugerID'ernes ASCII værdi, så chatId altid er ens for samme par
    const chatId = user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
    const chatRef = doc(db, 'chats', chatId);
  
    try {
      // Tjek om chatdokumentet allerede findes
      const chatDoc = await getDoc(chatRef);
  
      if (!chatDoc.exists()) {
        // Hent brugerdata for de to involverede brugere
        const user1Doc = await getDoc(doc(db, 'users', user1Id));
        const user2Doc = await getDoc(doc(db, 'users', user2Id));
  
        // Hvis brugerdokumenterne findes, brug deres navne og profilbilleder. Ellers brug standardværdier.
        const user1Data = user1Doc.exists() ? user1Doc.data() : { name: 'Unknown User', profilePicture: '' };
        const user2Data = user2Doc.exists() ? user2Doc.data() : { name: 'Unknown User', profilePicture: '' };
  
        // Opretter et nyt chatdokument i Firestore med deltagernes ID og oplysninger
        await setDoc(chatRef, {
          participants: [user1Id, user2Id],
          participantsInfo: [
            { id: user1Id, name: user1Data.name || 'Unknown User', profilePicture: user1Data.profilePicture || '' },
            { id: user2Id, name: user2Data.name || 'Unknown User', profilePicture: user2Data.profilePicture || '' },
          ],
          lastMessage: '',
          createdAt: new Date(),
        }, { merge: true }); // merge: true sikrer at eksisterende data ikke slettes, hvis dokumentet fandtes delvist
  
        console.log('Chat dokument oprettet korrekt:', (await getDoc(chatRef)).data());
      } else {
        console.log('Chat dokument findes allerede.');
      }
    } catch (error) {
      console.error('Fejl ved oprettelse af chat:', error);
    }
  };

/**
 * Opdaterer deltageroplysninger (navn og profilbillede) i en eksisterende chat,
 * hvis en bruger ændrer sin profil. Henter den nyeste brugerinformation fra Firestore,
 * og opdaterer participantsInfo-arrayet i chatdokumentet.
 *
 * @param {string} chatId - ID for chatten der skal opdateres
 * @param {string} userId - ID for den bruger der har opdateret sin profil
 */
const updateChatParticipantsInfo = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Opdaterer participantsInfo-arrayet: Find den rigtige bruger og opdater dens data
        const updatedParticipantsInfo = chatData.participantsInfo.map(participant =>
          participant.id === userId
            ? { ...participant, name: userData.name, profilePicture: userData.profilePicture }
            : participant
        );

        // Gemmer de opdaterede deltageroplysninger i Firestore
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
