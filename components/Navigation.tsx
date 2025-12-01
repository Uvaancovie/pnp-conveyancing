import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

type Props = {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
};

export function ScreenHeader({ title, showBack = true, showHome = true }: Props) {
  const router = useRouter();

  return (
    <XStack 
      backgroundColor="$brand"
      paddingVertical="$4"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
    >
      <XStack alignItems="center" gap="$3" flex={1}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text color="white" fontWeight="700" fontSize="$5" numberOfLines={1} flex={1}>{title}</Text>
      </XStack>
      
      {showHome && (
        <TouchableOpacity onPress={() => router.push('/')} hitSlop={8}>
          <Ionicons name="home" size={22} color="white" />
        </TouchableOpacity>
      )}
    </XStack>
  );
}

export function NavButton({ 
  icon, 
  label, 
  href, 
  variant = 'default' 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  href: string;
  variant?: 'default' | 'primary' | 'secondary';
}) {
  const router = useRouter();
  
  const bgColor = variant === 'primary' ? '$brand' : variant === 'secondary' ? '$brandLight' : '$card';
  const textColor = variant === 'primary' ? 'white' : '$color';
  const iconColor = variant === 'primary' ? 'white' : '#0A5C3B';

  return (
    <TouchableOpacity onPress={() => router.push(href as any)}>
      <XStack 
        backgroundColor={bgColor}
        borderRadius="$4"
        padding="$4"
        alignItems="center"
        gap="$3"
        borderWidth={1}
        borderColor="$border"
        hoverStyle={{ opacity: 0.9 }}
        pressStyle={{ scale: 0.98 }}
      >
        <View style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 20, 
          backgroundColor: variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(10,92,59,0.1)',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <YStack flex={1}>
          <Text fontWeight="700" fontSize="$4" color={textColor}>{label}</Text>
        </YStack>
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      </XStack>
    </TouchableOpacity>
  );
}

export function QuickNavBar() {
  const router = useRouter();
  
  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; href: string }[] = [
    { icon: 'home', label: 'Home', href: '/' },
    { icon: 'swap-horizontal', label: 'Transfer', href: '/transfer' },
    { icon: 'business', label: 'Bond', href: '/bond' },
    { icon: 'person', label: 'Profile', href: '/profile' },
  ];

  return (
    <XStack 
      backgroundColor="$card"
      borderTopWidth={1}
      borderTopColor="$border"
      paddingVertical="$2"
      justifyContent="space-around"
    >
      {items.map((item) => (
        <TouchableOpacity 
          key={item.href} 
          onPress={() => router.push(item.href as any)}
          style={{ alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Ionicons name={item.icon} size={22} color="#0A5C3B" />
          <Text fontSize="$2" color="$muted" marginTop="$1">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
}
