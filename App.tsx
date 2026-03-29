import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { PlayScreen } from './src/screens/PlayScreen';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default class App extends React.Component {
  componentDidMount() {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1000);
  }

  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
    });
    return (
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.container}>
              <PlayScreen />
              <StatusBar style="auto" />
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </I18nextProvider>
    );
  }
}
