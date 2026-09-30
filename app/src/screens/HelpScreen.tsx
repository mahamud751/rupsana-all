import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon, { IconName } from '../components/Icon';
import { Card, Screen, SectionTitle, StackHeader } from '../components/ui';
import { faqs } from '../data';
import { storeConfig } from '../config';
import { colors } from '../theme';

const open = (url: string) =>
  Linking.openURL(url).catch(() =>
    Alert.alert('Unable to open', 'Please try again from your phone.'),
  );

export default function HelpScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const contacts: {
    icon: IconName;
    label: string;
    value: string;
    url: string;
  }[] = [
    {
      icon: 'phone',
      label: 'Call us',
      value: storeConfig.phone,
      url: `tel:${storeConfig.phone}`,
    },
    {
      icon: 'chat',
      label: 'WhatsApp',
      value: 'Chat with our team',
      url: `https://wa.me/${storeConfig.whatsapp}`,
    },
    {
      icon: 'mail',
      label: 'Email',
      value: storeConfig.email,
      url: `mailto:${storeConfig.email}`,
    },
    {
      icon: 'pin',
      label: 'Visit our salon',
      value: storeConfig.salonAddress,
      url: `https://maps.google.com/?q=${encodeURIComponent(
        storeConfig.salonAddress,
      )}`,
    },
  ];

  return (
    <Screen>
      <StackHeader title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle>Contact us</SectionTitle>
        <View style={styles.grid}>
          {contacts.map(c => (
            <Pressable
              key={c.label}
              onPress={() => open(c.url)}
              style={styles.contact}
            >
              <View style={styles.icon}>
                <Icon name={c.icon} size={22} />
              </View>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactValue} numberOfLines={2}>
                {c.value}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hours}>{storeConfig.salonHours}</Text>

        <SectionTitle>Frequently asked questions</SectionTitle>
        <Card style={styles.faqCard}>
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <Pressable
                key={f.q}
                onPress={() => setOpenIndex(isOpen ? null : i)}
                style={[styles.faq, i < faqs.length - 1 && styles.faqBorder]}
              >
                <View style={styles.faqHead}>
                  <Text style={styles.q}>{f.q}</Text>
                  <View
                    style={{
                      transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                    }}
                  >
                    <Icon name="chevronRight" size={16} />
                  </View>
                </View>
                {isOpen && <Text style={styles.a}>{f.a}</Text>}
              </Pressable>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contact: {
    width: '48.5%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactLabel: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  contactValue: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  hours: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 12,
  },
  faqCard: { paddingVertical: 4 },
  faq: { paddingVertical: 14 },
  faqBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  q: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.text },
  a: { fontSize: 13.5, color: colors.brownSoft, lineHeight: 20, marginTop: 8 },
});
