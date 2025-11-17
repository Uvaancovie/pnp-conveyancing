import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <TamaguiProvider config={config}>
      {/* expo-router mounts screens from app/ */}
    </TamaguiProvider>
  );
}