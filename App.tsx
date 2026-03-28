import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { PlayScreen } from './src/screens/PlayScreen';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <View style={styles.container}>
        <PlayScreen />
        <StatusBar style="auto" />
      </View>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
});
