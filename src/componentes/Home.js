import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';

export default function Home() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        const obtenerCartas = async () => {
            try {
                // Barajar un nuevo mazo y obtener 20 cartas
                const deckRes = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
                const deckJson = await deckRes.json();

                const cardsRes = await fetch(`https://deckofcardsapi.com/api/deck/${deckJson.deck_id}/draw/?count=20`);
                const cardsJson = await cardsRes.json();

                setCards(cardsJson.cards);
            } catch (error) {
                console.error("Error al obtener cartas:", error);
            }
        };
        obtenerCartas();
    }, []);

    return (
        <ScrollView>
            <View style={styles.lista}>
                {cards.map((card, index) => (
                    <View key={index} style={styles.item}>
                        <Text>{card.code} - {card.value} of {card.suit}</Text>
                        <Image
                            source={{ uri: card.image }}
                            style={styles.imagen}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    lista: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        justifyContent: 'space-between',
        padding: 10,
    },
    item: {
        backgroundColor: 'aliceblue',
        width: '48%',
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagen: {
        width: 100,
        height: 140,
        resizeMode: 'contain',
    },
});
