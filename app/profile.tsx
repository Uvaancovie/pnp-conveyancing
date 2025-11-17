import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card } from '../components/Card';
import { Button, BtnText } from '../components/Button';
import { fetchMyCalculations, logout } from '../utils/firebase';
import { formatZAR } from '../lib/money';

export default function Profile(){
  const [calcs, setCalcs] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchMyCalculations().then(r => { if (mounted) setCalcs(r as any[]); });
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="My Profile">
        <View style={{ padding: 8 }}>
          <Text style={{ fontSize: 16 }}>Recent Calculations</Text>
        </View>
      </Card>

      <Card title="Saved Calculations"> 
        {calcs.length === 0 ? (
          <Text style={{ padding: 8 }}>No saved calculations yet</Text>
        ) : (
          calcs.map(c => (
            <View key={c.id} style={{ marginBottom: 12, backgroundColor: 'white', padding: 8, borderRadius: 6}}>
              <Text style={{ fontWeight: 'bold' }}>{c.type}</Text>
              <Text>{new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : Date.now()).toLocaleString()}</Text>
              <Text>{JSON.stringify(c.inputs)}</Text>
              <Text>{JSON.stringify(c.result)}</Text>
            </View>
          ))
        )}
      </Card>

      <Button onPress={() => logout().catch(()=>{})}><BtnText>Sign Out</BtnText></Button>
    </ScrollView>
  );
}
