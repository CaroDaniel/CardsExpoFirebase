import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function JuegoGuerra() {
  const [deckId, setDeckId] = useState(null);
  const [player1, setPlayer1] = useState([]);
  const [player2, setPlayer2] = useState([]);
  const [card1, setCard1] = useState(null);
  const [card2, setCard2] = useState(null);
  const [result, setResult] = useState('');
  const [uid, setUid] = useState(null);
  const [userWin, setUserWin] = useState(0);
  const [userLose, setUserLose] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserWin(data.ganados || 0);
          setUserLose(data.perdidos || 0);
        } else {
          await setDoc(docRef, { ganados: 0, perdidos: 0 });
        }
      } else {
        setUid(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const initGame = async () => {
      const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const json = await res.json();
      setDeckId(json.deck_id);

      const draw = await fetch(`https://deckofcardsapi.com/api/deck/${json.deck_id}/draw/?count=52`);
      const cards = await draw.json();

      const mitad = cards.cards.length / 2;
      setPlayer1(cards.cards.slice(0, mitad));
      setPlayer2(cards.cards.slice(mitad));
    };
    initGame();
  }, []);

  const getCardValue = (card) => {
    const value = card.value;
    if (value === 'ACE') return 14;
    if (value === 'KING') return 13;
    if (value === 'QUEEN') return 12;
    if (value === 'JACK') return 11;
    return parseInt(value);
  };

  const playTurn = () => {
    if (player1.length === 0 || player2.length === 0) return;

    const c1 = player1[0];
    const c2 = player2[0];

    setCard1(c1);
    setCard2(c2);

    const val1 = getCardValue(c1);
    const val2 = getCardValue(c2);

    if (val1 > val2) {
      setResult('Jugador 1 gana la ronda');
      setPlayer1([...player1.slice(1), c1, c2]);
      setPlayer2(player2.slice(1));
    } else if (val2 > val1) {
      setResult('Jugador 2 gana la ronda');
      setPlayer2([...player2.slice(1), c1, c2]);
      setPlayer1(player1.slice(1));
    } else {
      setResult('Empate');
      setPlayer1([...player1.slice(1)]);
      setPlayer2([...player2.slice(1)]);
    }
  };

  const guardarResultado = async (ganaJugador1) => {
    if (!uid) return;
    const fecha = new Date().toISOString();

    const resultado = {
      uid,
      fecha,
      juego: 'guerra',
      ganador: ganaJugador1 ? 'Jugador 1' : 'Jugador 2',
    };

    const nuevosGanados = ganaJugador1 ? userWin + 1 : userWin;
    const nuevosPerdidos = ganaJugador1 ? userLose : userLose + 1;

    try {
      await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
      await updateDoc(doc(db, 'usuarios', uid), {
        ganados: nuevosGanados,
        perdidos: nuevosPerdidos,
      });
      setUserWin(nuevosGanados);
      setUserLose(nuevosPerdidos);
    } catch (e) {
      console.error('Error guardando resultado:', e);
    }
  };

  useEffect(() => {
    if (player1.length === 0 && player2.length > 0) guardarResultado(false);
    if (player2.length === 0 && player1.length > 0) guardarResultado(true);
  }, [player1, player2]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Juego de Guerra - Cartas</Text>
      <Text style={styles.stats}>Ganados: {userWin} | Perdidos: {userLose}</Text>

      <View style={styles.cardRow}>
        <View style={styles.cardContainer}>
          <Text>Jugador 1</Text>
          {card1 && <Image source={{ uri: card1.image }} style={styles.card} />}
          <Text>Cartas: {player1.length}</Text>
        </View>
        <View style={styles.cardContainer}>
          <Text>Jugador 2</Text>
          {card2 && <Image source={{ uri: card2.image }} style={styles.card} />}
          <Text>Cartas: {player2.length}</Text>
        </View>
      </View>

      <Button title="Jugar Ronda" onPress={playTurn} disabled={player1.length === 0 || player2.length === 0} />

      <Text style={styles.result}>{result}</Text>

      {(player1.length === 0 || player2.length === 0) && (
        <Text style={styles.final}>
          {player1.length === 0 ? 'Jugador 2 gana el juego 🎉' : 'Jugador 1 gana el juego 🎉'}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  stats: { fontSize: 16, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cardContainer: { alignItems: 'center', margin: 10 },
  card: { width: 100, height: 145, resizeMode: 'contain' },
  result: { fontSize: 18, marginVertical: 20 },
  final: { fontSize: 20, fontWeight: 'bold', color: 'green', marginTop: 20 },
});
