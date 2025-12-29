import { useState } from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from './Button';

interface SaveCalculationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export function SaveCalculationModal({ visible, onClose, onSave, defaultName = '' }: SaveCalculationModalProps) {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    onSave(name);
    setName('');
    onClose();
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
