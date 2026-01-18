import React, { useEffect, useRef } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, LayoutChangeEvent } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

const { width: screenWidth } = Dimensions.get('window')
void screenWidth

interface TabItemProps {
  label: string
  icon: string
  iconOutline: string
  isActive: boolean
  badge?: number
  onPress: () => void
  onLayout?: (event: LayoutChangeEvent) => void
  animatedScale: Animated.Value
}

const TabItem: React.FC<TabItemProps> = ({
  label,
  icon,
  iconOutline,
  isActive,
  badge,
  onPress,
  onLayout,
  animatedScale,
}) => {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      {isActive && (
        <View style={[styles.activeCircle]}>
          <LinearGradient
            colors={['#004D4D', '#005F5F', '#1A0F3D']}
            locations={[0, 0.5, 1]}
            style={{
              width: 97,
              height: 64,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: animatedScale }] }]}>
        <Icon name={isActive ? icon : iconOutline} size={40} color={isActive ? '#FFFFFF' : '#FFFFFF'} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

const tabConfig = [
  { key: 'Tab Home Stack', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  {
    key: 'Tab Credential Stack',
    label: 'ListCredentials',
    icon: 'text-box-multiple',
    iconOutline: 'text-box-multiple-outline',
  },
  { key: 'Tab Connect Stack', label: 'Settings', icon: 'cog', iconOutline: 'cog-outline' },
]

const routeToTabKey: Record<string, string> = {
  'Tab Home Stack': 'Tab Home Stack',
  'Tab Credential Stack': 'Tab Credential Stack',
  'Tab Connect Stack': 'Tab Connect Stack',
}

interface DigiCredTabBarProps extends Partial<BottomTabBarProps> {
  badges?: Record<string, number>
}

const DigiCredTabBar: React.FC<DigiCredTabBarProps> = ({ state, navigation, badges = {} }) => {
  const insets = useSafeAreaInsets()

  const pillPosition = useRef(new Animated.Value(0)).current
  const tabScales = useRef(tabConfig.map(() => new Animated.Value(1))).current
  const tabPositions = useRef<{ x: number; width: number }[]>([]).current
  const currentIndex = state?.index || 0

  useEffect(() => {
    if (tabPositions.length > currentIndex && tabPositions[currentIndex]) {
      const targetTab = tabPositions[currentIndex]
      Animated.parallel([
        Animated.spring(pillPosition, {
          toValue: targetTab.x + targetTab.width / 2 - 30,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }),
        ...tabScales.map((scale, index) =>
          Animated.spring(scale, {
            toValue: index === currentIndex ? 1.1 : 1,
            useNativeDriver: true,
            friction: 6,
            tension: 100,
          })
        ),
      ]).start()
    }
  }, [currentIndex, pillPosition, tabPositions, tabScales])

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout
    tabPositions[index] = { x, width }
    if (index === currentIndex && tabPositions.length > 0) {
      pillPosition.setValue(x + width / 2 - 30)
    }
  }

  if (!state || !navigation) {
    return (
      <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <LinearGradient
          colors={['#25272A', '#1E2023']}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {tabConfig.map((tab, index) => (
            <TabItem
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              iconOutline={tab.iconOutline}
              isActive={index === 0}
              badge={badges[tab.key]}
              onPress={() => {}}
              onLayout={handleTabLayout(index)}
              animatedScale={tabScales[index]}
            />
          ))}
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <LinearGradient
        colors={['#25272A', '#1E2023']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
          const tabKey = routeToTabKey[route.name] || route.name
          const config = tabConfig.find((t) => t.key === tabKey) || tabConfig[index % tabConfig.length]

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TabItem
              key={route.key}
              label={config?.label || route.name}
              icon={config?.icon || 'circle'}
              iconOutline={config?.iconOutline || 'circle-outline'}
              isActive={isFocused}
              badge={badges[route.name]}
              onPress={onPress}
              onLayout={handleTabLayout(index)}
              animatedScale={tabScales[index]}
            />
          )
        })}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 65,
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#004D4D',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'visible',
  },
  tabItem: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginHorizontal: 28,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -20,
    right: -12,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    minWidth: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  activeCircle: {
    position: 'absolute',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    marginLeft: 0,
  },
})

export default DigiCredTabBar