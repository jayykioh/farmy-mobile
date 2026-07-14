import { Tabs } from 'expo-router';
import { Home, BookText, Bot, User } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: colors.borderMain,
        elevation: 0,
        height: 60,
        paddingBottom: 8,
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
