import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminScreen } from '../screens/AdminScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DeckDetailScreen } from '../screens/DeckDetailScreen';
import { DecksScreen } from '../screens/DecksScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RevisionsScreen } from '../screens/RevisionsScreen';
import { StudySessionScreen } from '../screens/StudySessionScreen';
import { useThemeColors } from '../theme';

export type AppStackParamList = {
  Dashboard: undefined;
  Decks: undefined;
  DeckDetail: { deckId: number; deckName: string };
  StudySession: { deckId: number; deckName: string; mode?: 'study' | 'revision' };
  Revisions: { deckId?: number } | undefined;
  Community: undefined;
  Admin: undefined;
  Calendar: undefined;
  Friends: undefined;
  FriendProfile: { friendPublicId: number; friendName?: string };
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const colors = useThemeColors();
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: 'DMSans_700Bold', fontSize: 17, color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false, title: 'Cardly' }}
      />
      <Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'Minhas Disciplinas' }} />
      <Stack.Screen name="Revisions" component={RevisionsScreen} options={{ title: 'Revisões' }} />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={({ route }) => ({ title: route.params.deckName })}
      />
      <Stack.Screen
        name="StudySession"
        component={StudySessionScreen}
        options={({ route }) => ({ title: `Revisão: ${route.params.deckName}` })}
      />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: 'Comunidade' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendário' }} />
      <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Amigos' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificações' }} />
      <Stack.Screen
        name="FriendProfile"
        component={FriendProfileScreen}
        options={({ route }) => ({ title: route.params.friendName ?? 'Perfil do amigo' })}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Administração' }} />
    </Stack.Navigator>
  );
}
