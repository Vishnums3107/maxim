import { View } from 'react-native';
import { colors } from '../src/theme/tokens';

export default function Index() {
  // Pure void — root _layout decides where to navigate. Avoids a flash of
  // a generic spinner over our branded loader.
  return <View style={{ flex: 1, backgroundColor: colors.bg.void }} />;
}
