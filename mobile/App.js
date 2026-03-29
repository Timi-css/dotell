import { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation';

SplashScreen.preventAutoHideAsync();

export default function App() {
        const [fontsLoaded] = useFonts({
                'CabinetGrotesk-Bold': require('./assets/fonts/CabinetGrotesk-Bold.ttf'),
                'CabinetGrotesk-Medium': require('./assets/fonts/CabinetGrotesk-Medium.ttf'),
                'CabinetGrotesk-Regular': require('./assets/fonts/CabinetGrotesk-Regular.ttf'),
                'GeneralSans-Regular': require('./assets/fonts/GeneralSans-Regular.ttf'),
                'GeneralSans-Medium': require('./assets/fonts/GeneralSans-Medium.ttf'),
                'GeneralSans-Semibold': require('./assets/fonts/GeneralSans-Semibold.ttf'),
        });

        const onLayoutRootView = useCallback(async () => {
                if (fontsLoaded) {
                        await SplashScreen.hideAsync();
                }
        }, [fontsLoaded]);

        if (!fontsLoaded) return null;

        return (
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                        <StatusBar style="auto" />
                        <RootNavigator />
                </View>
        );
}