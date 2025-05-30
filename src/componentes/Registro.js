import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [fecha, setFecha] = useState('');
    const [telefono, setTelefono] = useState('');
    const navigation = useNavigation();

    const handleRegistro = async () => {
        if (!nombre || !correo || !contrasena) {
            Alert.alert('Error', 'Por favor llena todos los campos requeridos');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;

            // Guardar datos adicionales en Firestore con UID como ID
            await setDoc(doc(db, 'usuarios', user.uid), {
                uid: user.uid,
                nombre,
                correo,
                fecha,
                telefono,
                ganados: 0,
                perdidos: 0,
            });

            Alert.alert('Éxito', 'Usuario registrado correctamente');
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Error al registrarse', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Registro</Text>
            <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
            <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Contraseña" value={contrasena} onChangeText={setContrasena} secureTextEntry style={styles.input} />
            <TextInput placeholder="Fecha de nacimiento (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} style={styles.input} />
            <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
            <Button title="Registrarse" onPress={handleRegistro} />
            <View style={{ marginTop: 10 }}>
                <Button title="¿Ya tienes cuenta? Inicia sesión" onPress={() => navigation.navigate('Login')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    titulo: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 12,
        borderRadius: 6,
    },
});
