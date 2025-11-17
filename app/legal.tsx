import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import theme from '../config/theme.json';
export default function Legal(){
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Disclaimer">
        {theme.disclaimer}
      </Card>
    </ScrollView>
  );
}