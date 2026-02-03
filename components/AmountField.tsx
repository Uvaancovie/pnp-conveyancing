import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, Input as TInput, XStack, YStack } from 'tamagui';

interface AmountFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  presets?: number[];
  keyboardType?: any;
  error?: string;
  suffix?: string;
  maxLength?: number;
}

export function AmountField({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  helpText,
  presets,
  error,
  suffix = '',
  maxLength,
  ...props 
}: AmountFieldProps) {
  const [focused, setFocused] = useState(false);

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const cleaned = val.replace(/\s|,/g, '');
    if (isNaN(Number(cleaned))) return val;
    return Number(cleaned).toLocaleString('en-ZA');
  };

  const handlePreset = (amount: number) => {
    onChangeText(amount.toString());
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <YStack gap="$2">
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$color" fontWeight="600" fontSize="$4">{label}</Text>
        {value && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </XStack>
      
      <TInput 
        borderRadius="$2" 
        borderWidth={focused ? 2 : 1} 
        borderColor={error ? '#EF4444' : focused ? '$brand' : '$border'} 
        padding="$3" 
        paddingRight={suffix ? '$8' : '$3'}
        backgroundColor="$bg" 
        color="$color"
        fontSize="$5"
        fontWeight="600"
        value={focused ? value : formatDisplay(value)}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        {...props}
      />
      
      {suffix && (
        <Text 
          position="absolute" 
          right={16} 
          top={46}
          color="$muted" 
          fontSize="$4"
          fontWeight="600"
        >
          {suffix}
        </Text>
      )}

      {error && (
        <Text color="#EF4444" fontSize="$2">{error}</Text>
      )}
      
      {helpText && !error && (
        <Text color="$muted" fontSize="$2">{helpText}</Text>
      )}

      {presets && presets.length > 0 && (
        <XStack gap="$2" flexWrap="wrap">
          {presets.map((preset) => (
            <TouchableOpacity key={preset} onPress={() => handlePreset(preset)}>
              <YStack
                backgroundColor={value === preset.toString() ? '$brand' : '$bg'}
                borderWidth={1}
                borderColor={value === preset.toString() ? '$brand' : '$border'}
                borderRadius="$2"
                paddingVertical="$1.5"
                paddingHorizontal="$2.5"
                hoverStyle={{ backgroundColor: '$brandLight' }}
              >
                <Text 
                  color={value === preset.toString() ? 'white' : '$color'} 
                  fontSize="$2"
                  fontWeight="600"
                >
                  R{(preset / 1000000).toFixed(1)}M
                </Text>
              </YStack>
            </TouchableOpacity>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
