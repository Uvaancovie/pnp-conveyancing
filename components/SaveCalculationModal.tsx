import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';
import type { UserRole } from '../types/auth';
import { BtnText, Button } from './Button';

interface SaveCalculationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;

  /** Must be 'customer' (Homeowner) or 'agent' (Realtor) to save */
  userRole?: UserRole | null;
}

export function SaveCalculationModal({ visible, onClose, onSave, defaultName = '', userRole }: SaveCalculationModalProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);

  const canSave = useMemo(() => userRole === 'customer' || userRole === 'agent', [userRole]);

  const handleSave = () => {
    if (!canSave) return;
    onSave(name);
    setName('');
    onClose();
  };

  const goToRegister = () => {
    onClose();
    router.push('/register');
  };

  const goToLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <YStack gap="$4" padding="$4" backgroundColor="white" borderRadius="$4" width="80%" maxWidth={400}>
                <Text fontSize="$6" fontWeight="bold">Save Calculation</Text>

                {!canSave ? (
                  <>
                    <Text color="$muted">You must be registered as a Homeowner or Realtor to save calculations.</Text>
                    <XStack gap="$3" justifyContent="flex-end">
                      <Button variant="outline" onPress={goToLogin} flex={1}>
                        <BtnText color="$brand">Sign In</BtnText>
                      </Button>
                      <Button onPress={goToRegister} flex={1}>
                        <BtnText>Create Account</BtnText>
                      </Button>
                    </XStack>
                    <Button variant="secondary" onPress={onClose}>
                      <BtnText color="$brand">Not now</BtnText>
                    </Button>
                  </>
                ) : (
                  <>
                    <Text color="$muted">Give your calculation a name to easily find it later.</Text>
                    
                    <Input 
                      value={name} 
                      onChangeText={setName} 
                      placeholder="e.g. 123 Main Street" 
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      borderWidth={1}
                      padding="$2"
                      borderRadius="$2"
                    />

                    <XStack gap="$3" justifyContent="flex-end">
                      <Button variant="outline" onPress={onClose} flex={1}>
                        <BtnText color="$brand">Cancel</BtnText>
                      </Button>
                      <Button onPress={handleSave} flex={1}>
                        <BtnText>Save</BtnText>
                      </Button>
                    </XStack>
                  </>
                )}
              </YStack>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
});
