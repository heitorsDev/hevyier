import { TextInput, StyleSheet } from "react-native";

import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * Bordered single-line filter input. Keyboard is acceptable here —
 * library management happens at home, not mid-set (Phase 2 spec).
 *
 * Usage: `<SearchField value={q} onChange={setQ} placeholder="SEARCH" />`
 */
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    paddingHorizontal: 12,
  },
});
