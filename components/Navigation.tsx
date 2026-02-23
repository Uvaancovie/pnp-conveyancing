import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Platform, TouchableOpacity, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import theme from '../config/theme.json';

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
        <TouchableOpacity onPress={() => router.push('/dashboard')} hitSlop={8}>
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
  
  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; href: string; isExternal?: boolean }[] = [
    { icon: 'home', label: 'Home', href: '/dashboard' },
    { icon: 'logo-whatsapp', label: 'WhatsApp', href: `https://wa.me/${theme.whatsappNumber}`, isExternal: true },
    { icon: 'briefcase', label: 'Services', href: '/services' },
    { icon: 'person', label: 'Profile', href: '/profile' },
  ];

  const handlePress = (item: typeof items[0]) => {
    if (item.isExternal) {
      const msg = 'Hi Pather & Pather, I have a question.';
      const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        Linking.openURL(url);
      }
    } else {
      router.push(item.href as any);
    }
  };

  return (
    <XStack 
      backgroundColor="white"
      borderTopWidth={1}
      borderTopColor="#e0e0e0"
      paddingVertical="$3"
      paddingBottom="$4"
      justifyContent="space-around"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      shadowColor="rgba(0,0,0,0.1)"
      shadowRadius={8}
      shadowOffset={{ width: 0, height: -2 }}
      elevationAndroid={5}
    >
      {items.map((item) => (
        <TouchableOpacity 
          key={item.href} 
          onPress={() => handlePress(item)}
          style={{ alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 }}
        >
          <Ionicons name={item.icon} size={24} color="#0A5C3B" />
          <Text fontSize={13} color="#666" marginTop="$1" fontFamily="Poppins_400Regular">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
}
