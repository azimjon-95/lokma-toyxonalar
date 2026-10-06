import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../src/theme';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.box}>
        <Text style={styles.title}>Sahifa topilmadi</Text>
        <Link href="/" style={styles.link}>Bosh sahifaga qaytish</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.white },
  title: { ...typography.h3, color: colors.text },
  link: { ...typography.bodySemiBold, color: colors.primary },
});
