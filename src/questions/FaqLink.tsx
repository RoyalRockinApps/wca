/** Ask the School's way to the school's F.A.Q.s (app/questions/faq.tsx). */
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import home from '../../content/site/home.json';
import { faqSection } from '../site/faq';
import type { Section } from '../site/types';
import { C, Card, P } from '../ui';

/** Only when the school's home page has F.A.Q.s. */
const HAS_FAQ = faqSection((home as unknown as { sections: Section[] }).sections) !== null;

export function FaqLink() {
  if (!HAS_FAQ) return null;
  return (
    <Card onPress={() => router.push('/questions/faq')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name="help-circle-outline" size={30} color={C.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>F.A.Q.s</Text>
        <P muted>Quick answers about admissions, tuition, school hours and more.</P>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.primary} />
    </Card>
  );
}
