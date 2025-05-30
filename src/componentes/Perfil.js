import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function Perfil() {
    const [nombre, setNombre] = useState('');
    const [fecha, setFecha] = useState('');
    const [telefono, setTelefono] = useState('');
    const [documento, setDocumento] = useState('');
    const [cargando, setCargando] = useState(true);

    const uid = auth.currentUser?.uid;

    useEffect(() => {
        if (!uid) {
            Alert.alert('No hay usuario autenticado');
            setCargando(false);
            return;
        }

        const traerDatos = async () => {
            try {
                const docRef = doc(db, 'usuarios', uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setNombre(data.nombre || '');
                    setFecha(data.fecha || '');
                    setTelefono(data.telefono || '');
                    setDocumento(data.documento || '');
                } else {
                    Alert.alert('Usuario no encontrado');
                }
            } catch (error) {
                Alert.alert('Error al cargar datos');
                console.error(error);
            } finally {
                setCargando(false);
            }
        };

        traerDatos();
    }, [uid]);

    const actualizarDatos = async () => {
        try {
            if (!uid) {
                Alert.alert('No hay usuario autenticado');
                return;
            }
            const docRef = doc(db, 'usuarios', uid);
            await updateDoc(docRef, {
                nombre,
                fecha,
                telefono,
                documento,
            });
            Alert.alert('Datos actualizados');
        } catch (error) {
            console.error(error);
            Alert.alert('Error al actualizar');
        }
    };

    if (cargando) return <Text style={styles.cargando}>Cargando...</Text>;

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Perfil del Usuario</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Fecha de nacimiento (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} />
            <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
            />
            <TextInput style={styles.input} placeholder="Documento" value={documento} onChangeText={setDocumento} />
            <Button title="Guardar cambios" onPress={actualizarDatos} />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { padding: 20, flex: 1, backgroundColor: '#fff' },
    titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
    },
    cargando: {
        marginTop: 50,
        textAlign: 'center',
    },
});
