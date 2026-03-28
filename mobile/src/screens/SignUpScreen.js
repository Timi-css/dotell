import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SignUp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brand.ember,
  },
});
