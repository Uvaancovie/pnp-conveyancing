import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from './Button';

interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <YStack gap="$4" padding="$4" backgroundColor="white" borderRadius="$4" width="80%" maxWidth={420}>
                <YStack gap="$2">
                  <Text fontSize="$6" fontWeight="700">{title}</Text>
                  <Text color="$muted">{message}</Text>
                </YStack>

                <XStack gap="$3" justifyContent="flex-end">
                  <Button variant="outline" onPress={onCancel} flex={1}>
                    <BtnText color="$brand">{cancelText}</BtnText>
                  </Button>
                  <Button onPress={onConfirm} flex={1}>
                    <BtnText>{confirmText}</BtnText>
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
