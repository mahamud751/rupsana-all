import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Logo from '../components/Logo';
import { InfoStrip } from '../components/Promo';
import { Card, Screen, StackHeader } from '../components/ui';
import { heroSlides } from '../data';
import { storeConfig } from '../config';
import { colors, serifMediumItalic } from '../theme';

const version = require('../../package.json').version as string;

export default function AboutScreen() {
  return (
    <Screen>
      <StackHeader title="About" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          <Logo />
        </View>
        <Image source={heroSlides[0].image} style={styles.image} />
        <Text style={styles.heading}>Your bridal look starts here</Text>
        <Text style={styles.body}>
          Rupsuhana brings together premium bridal jewellery, makeup, hair
          accessories and skincare, so every bride can find everything for her
          special day in one place.
        </Text>
        <Text style={styles.body}>
          At our salon, our artists offer bridal makeup, hair styling and
          personal consultations for holud, wedding and reception looks.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Salon</Text>
          <Text style={styles.value}>{storeConfig.salonAddress}</Text>
          <Text style={styles.label}>Opening hours</Text>
          <Text style={styles.value}>{storeConfig.salonHours}</Text>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>
            {storeConfig.phone} · {storeConfig.email}
          </Text>
        </Card>
        <InfoStrip />
        <Text style={styles.version}>Version {version}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  logo: { alignItems: 'center', marginVertical: 12 },
  image: {
    marginHorizontal: 16,
    height: 220,
    borderRadius: 20,
    width: undefined,
  },
  heading: {
    ...serifMediumItalic,
    fontSize: 24,
    color: colors.brown,
    textAlign: 'center',
    marginTop: 18,
    marginHorizontal: 16,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.brownSoft,
    marginHorizontal: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  card: { marginHorizontal: 16, marginTop: 20 },
  label: {
    fontSize: 11.5,
    letterSpacing: 1.5,
    color: colors.gold,
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  value: { fontSize: 14, color: colors.text, marginTop: 3 },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 20,
  },
});
