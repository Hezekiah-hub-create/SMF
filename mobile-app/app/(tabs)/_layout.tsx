// @ts-nocheck
import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, Text } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import FloatingChatbot from '@/components/FloatingChatbot';
import { useAuth } from '../../context/AuthContext';
import { useUnreadNotificationCount } from '../../hooks/useUnreadNotificationCount';

const ACTIVE = '#4169E1';
const INACTIVE = '#94A3B8';
const ACTIVE_BG = '#EEF2FF';

function TabIcon({ iconFocused, iconUnfocused, focused }) {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <IconSymbol
        size={isSmallPhone ? 20 : 22}
        name={focused ? iconFocused : iconUnfocused}
        color={focused ? ACTIVE : INACTIVE}
      />
    </View>
  );
}

export default function TabLayout() {
  const { width, height } = useWindowDimensions();
  const { user, token } = useAuth();
  const { unreadCount } = useUnreadNotificationCount();
  
  const isSmallPhone = Math.min(width, height) < 360;
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  
  // Calculate responsive values
  const tabBarHeight = isTablet ? 80 : isSmallPhone ? 60 : 68;
  const tabBarMargin = isTablet ? 12 : isSmallPhone ? 4 : 8;
  const tabBarPadding = isTablet ? 12 : 7;
  const iconSize = isSmallPhone ? 20 : 22;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarStyle: {
            position: 'absolute',
            bottom: tabBarMargin,
            left: tabBarMargin,
            right: tabBarMargin,
            marginHorizontal: tabBarMargin,
            backgroundColor: '#FFFFFF',
            borderRadius: isSmallPhone ? 30 : 40,
            height: tabBarHeight,
            paddingBottom: tabBarPadding,
            paddingTop: tabBarPadding,
            shadowColor: ACTIVE,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.14,
            shadowRadius: 20,
            elevation: 14,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: isSmallPhone ? 9 : 10,
            fontWeight: '600',
            marginTop: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconFocused="house.fill" iconUnfocused="house" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'Submit',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconFocused="plus.circle.fill" iconUnfocused="plus.circle" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="counseling"
        options={{
          title: 'Counsel',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconFocused="heart.fill" iconUnfocused="heart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconFocused="doc.text.fill" iconUnfocused="doc.text" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <View style={styles.notifIconContainer}>
              <IconSymbol
                size={isSmallPhone ? 20 : 22}
                name={focused ? "bell.fill" : "bell"}
                color={focused ? ACTIVE : INACTIVE}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconFocused="person.fill" iconUnfocused="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
    <FloatingChatbot user={user} token={token} />
  </>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: ACTIVE_BG,
  },
  notifIconContainer: {
    position: 'relative',
    width: 44,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
