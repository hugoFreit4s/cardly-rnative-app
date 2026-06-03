import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { useThemeColors } from '../theme';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

export function RootNavigator() {
  const { user, ready } = useAuth();
  const colors = useThemeColors();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}
