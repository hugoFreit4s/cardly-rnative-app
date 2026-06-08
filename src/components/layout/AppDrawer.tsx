import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { useThemeColors, type ThemeColors } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

type DrawerScreen = 'Decks' | 'Revisions' | 'Community' | 'Friends' | 'Calendar' | 'Admin';

type DrawerItem = {
  label: string;
  screen: DrawerScreen;
  adminOnly?: boolean;
};

const NAV_ITEMS: DrawerItem[] = [
  { label: 'Minhas Disciplinas', screen: 'Decks' },
  { label: 'Revisões', screen: 'Revisions' },
  { label: 'Comunidade', screen: 'Community' },
  { label: 'Amigos', screen: 'Friends' },
  { label: 'Calendário', screen: 'Calendar' },
  { label: 'Administração', screen: 'Admin', adminOnly: true },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = 280;
const SWIPE_CLOSE_THRESHOLD = 80;
const DRAWER_ANIMATION = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
};

export function AppDrawer({ open, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const dragStartX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withTiming(open ? 0 : -DRAWER_WIDTH, DRAWER_ANIMATION);
  }, [open, translateX]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      const next = dragStartX.value + event.translationX;
      translateX.value = Math.min(0, Math.max(-DRAWER_WIDTH, next));
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_CLOSE_THRESHOLD || event.velocityX < -500) {
        translateX.value = withTiming(-DRAWER_WIDTH, DRAWER_ANIMATION);
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, DRAWER_ANIMATION);
      }
    });

  function navigateTo(screen: DrawerScreen) {
    onClose();
    navigation.navigate(screen);
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'SUPERADMIN');

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={onClose} />
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.drawer, drawerStyle]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Cardly</Text>
              <Text style={styles.drawerSubtitle}>Menu de navegação</Text>
            </View>
            <View style={styles.drawerBody}>
              {visibleItems.map((item) => (
                <Pressable
                  key={item.screen}
                  style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
                  onPress={() => navigateTo(item.screen)}
                >
                  <Text style={styles.navItemText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, topInset: number) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      paddingTop: Math.max(topInset, 12),
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      shadowColor: '#0F172A',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    drawerHeader: {
      marginHorizontal: 16,
      marginBottom: 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    drawerTitle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.text,
    },
    drawerSubtitle: {
      marginTop: 4,
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.textMuted,
    },
    drawerBody: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 24,
    },
    navItem: {
      marginBottom: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
    },
    navItemPressed: {
      opacity: 0.85,
      backgroundColor: colors.surfaceAlt,
    },
    navItemText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.text,
    },
  });
}
