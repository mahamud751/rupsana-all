import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme';

function Lotus({ size = 46 }: { size?: number }) {
  const stroke = {
    stroke: 'url(#gold)',
    strokeWidth: 1.4,
    fill: 'none',
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  return (
    <Svg width={size * 1.7} height={size} viewBox="0 0 80 46">
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D6AE66" />
          <Stop offset="1" stopColor="#A77A33" />
        </LinearGradient>
      </Defs>
      <Path d="M40 3C47 11 47 27 40 36 33 27 33 11 40 3Z" {...stroke} />
      <Path
        d="M40 13.5c2.2 4 2.2 10 0 14.5-2.2-4.5-2.2-10.5 0-14.5z"
        fill="#E9A3A6"
      />
      <Path d="M40 36C31 32 25 22 27 11c6 3.5 11 11 13 25z" {...stroke} />
      <Path d="M40 36c9-4 15-14 13-25-6 3.5-11 11-13 25z" {...stroke} />
      <Path d="M40 37C28 38 17 32 13 22c9-1 20 4 27 15z" {...stroke} />
      <Path d="M40 37c12 1 23-5 27-15-9-1-20 4-27 15z" {...stroke} />
      <Path d="M20 41c10-3 30-3 40 0" {...stroke} />
    </Svg>
  );
}

function Ornament() {
  return (
    <Svg width={80} height={10} viewBox="0 0 80 10">
      <Path
        d="M6 5h24M50 5h24"
        stroke={colors.goldLight}
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      <Path
        d="M33 5c1.5-2.5 3.5-2.5 4 0M47 5c-1.5-2.5-3.5-2.5-4 0"
        stroke={colors.gold}
        strokeWidth={0.8}
        fill="none"
      />
      <Path d="M40 1.5l3 3.5-3 3.5-3-3.5z" fill={colors.gold} />
    </Svg>
  );
}

export default function Logo() {
  return (
    <View style={styles.container}>
      <Lotus size={38} />
      <Text style={styles.wordmark}>RUPSUHANA</Text>
      <Text style={styles.tagline}>{'BRIDAL & BEAUTY'}</Text>
      <Ornament />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  wordmark: {
    fontFamily: fonts.logo,
    fontSize: 24,
    color: colors.brown,
    letterSpacing: 0.6,
    marginTop: -2,
    lineHeight: 30,
  },
  tagline: {
    fontSize: 7.5,
    letterSpacing: 3.2,
    color: colors.brownSoft,
    fontWeight: '500',
    marginTop: -1,
  },
});
