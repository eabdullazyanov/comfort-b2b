import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SUPPORTED_LANGUAGES } from "../i18n/supportedLanguages";

/** In-app language toggle; switches the active i18next language on press. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((language) => {
        const active = i18n.language === language;
        return (
          <Pressable
            key={language}
            accessibilityRole="button"
            onPress={() => {
              void i18n.changeLanguage(language);
            }}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {t(`language.${language}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: "#888",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonActive: {
    backgroundColor: "#888",
  },
  label: {
    color: "#888",
    fontSize: 14,
  },
  labelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
