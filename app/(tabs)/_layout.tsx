import { Tabs } from 'expo-router';
import { Home, BookText, Bot, User } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarActiveBackgroundColor: colors.primaryLightest,
      tabBarLabelStyle: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
      },
      tabBarItemStyle: {
        borderRadius: 14,
        marginHorizontal: 4,
        marginVertical: 5,
      },
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: colors.borderMain + '80',
        backgroundColor: colors.bgSurface,
        height: 64 + insets.bottom,
        paddingHorizontal: 8,
        paddingTop: 4,
        paddingBottom: Math.max(insets.bottom, 8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 8,
      }
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }} 
      />
      <Tabs.Screen 
        name="diary" 
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ color }) => <BookText color={color} size={24} />
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{
          title: 'Trợ lý AI',
          tabBarIcon: ({ color }) => <Bot color={color} size={24} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => <User color={color} size={24} />
        }} 
      />
    </Tabs>
  );
}
