import { useAppTheme } from '@/hooks/themeHook';
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const AuraCoreLogo = require('../assets/images/fitness-logos/AuraCore-logo.png');
const fit1 = require('../assets/images/fitness-logos/fit1.png');
const fit2 = require('../assets/images/fitness-logos/fit2.png');
const fit3 = require('../assets/images/fitness-logos/fit3.png');
const fit4 = require('../assets/images/fitness-logos/fit4.png');

const ORBIT_RADII = [60, 90, 120, 150];
const LOGO_SIZE = 40;

interface Orbit {
  logo: any;
  radius: number;
  angle: string;
}

const orbits: Orbit[] = [
  { logo: fit2, radius: ORBIT_RADII[1]!, angle: '135deg' },
  { logo: fit4, radius: ORBIT_RADII[2]!, angle: '315deg' },
  { logo: fit3, radius: ORBIT_RADII[3]!, angle: '45deg' },
  { logo: fit1, radius: ORBIT_RADII[3]!, angle: '225deg' },
];

const OrbitingIcons = () => {
  const { Colors } = useAppTheme();

  const ORBIT_COLORS = [
    Colors.primaryColor + 'B3', // 70% opacity
    Colors.primaryColor + '80', // 50% opacity
    Colors.primaryColor + '4D', // 30% opacity
    Colors.primaryColor + '1A', // 10% opacity
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundColor }]}>
      <Image source={AuraCoreLogo} style={styles.centerLogo} />
      {ORBIT_RADII.map((radius, index) => (
        <View
          key={`orbit-${index}`}
          style={[
            styles.orbit,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              borderColor: ORBIT_COLORS[index],
            },
          ]}
        />
      ))}
      {orbits.map(({ logo, radius, angle }, index) => {
        return (
          <View
            key={`logo-${index}`}
            style={[
              styles.logoContainer,
              {
                transform: [{ rotate: angle }, { translateX: radius }],
              },
            ]}
          >
            <View style={[styles.logoBg, { 
              backgroundColor: Colors.surface, 
              borderColor: Colors.white,
              shadowColor: Colors.shadow 
            }]}>
              <Image
                source={logo}
                style={[
                  styles.logo,
                  {
                    transform: [{ rotate: `-${angle}` }],
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
  },
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoBg: {
    width: LOGO_SIZE + 8,
    height: LOGO_SIZE + 8,
    borderRadius: (LOGO_SIZE + 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },
});

export default OrbitingIcons;
