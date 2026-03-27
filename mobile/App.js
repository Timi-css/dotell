import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './src/theme';

export default function App() {
        return (
                <View style={styles.container}>
                        <Text style={styles.title}>doTell</Text>
                        <Text style={styles.subtitle}>Honest reviews. Better hiring.</Text>
                        <StatusBar style="auto" />
                </View>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
                alignItems: 'center',
                justifyContent: 'center',
        },
        title: {
                fontSize: 32,
                fontWeight: '700',
                color: colors.brand.ember,
                marginBottom: 8,
        },
        subtitle: {
                fontSize: 14,
                color: colors.text.stone,
        },
});