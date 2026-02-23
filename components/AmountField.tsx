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
  editable?: boolean;
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
  editable = true,
  ...props 
}: AmountFieldProps) {
  const [focused, setFocused] = useState(false);

  const formatDisplay = (val: string) => {
    if (!val) return '';
    // For suffix fields (like percentages), don't format
    if (suffix) return val;
    const cleaned = val.replace(/\s|,|R/g, '');
    if (isNaN(Number(cleaned))) return val;
    // Format with spaces as thousand separator (South African standard)
    return Number(cleaned).toLocaleString('en-ZA').replace(/,/g, ' ');
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
      </XStack>
      
      <XStack 
        alignItems="center"
        borderRadius="$2" 
        borderWidth={1} 
        borderColor={error ? '#EF4444' : '$border'} 
        backgroundColor="$bg"
        paddingLeft="$3"
      >
        {!suffix && (
          <Text 
            color={value || focused ? "$color" : "$muted"} 
            fontSize="$5" 
            fontWeight="600"
            marginRight="$1"
          >
            R
          </Text>
        )}
        <TInput 
          flex={1}
          borderWidth={0}
          padding="$3" 
          paddingLeft="$1"
          paddingRight={suffix ? '$8' : '$3'}
          backgroundColor="transparent" 
          color="$color"
          fontSize="$5"
          fontWeight="600"
          outlineWidth={0}
          outlineStyle="none"
          focusStyle={{ borderWidth: 0, outlineWidth: 0, outlineStyle: 'none' }}
          value={formatDisplay(value)}
          onChangeText={onChangeText}
          placeholder={placeholder}
          onFocus={() => editable && setFocused(true)}
          onBlur={() => editable && setFocused(false)}
          maxLength={maxLength}
          editable={editable}
          focusable={editable}
          {...props}
        />
      </XStack>
      
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
