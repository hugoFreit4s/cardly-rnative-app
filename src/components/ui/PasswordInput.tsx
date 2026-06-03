import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  containerClassName?: string;
};

export function PasswordInput({
  value,
  onChangeText,
  placeholder = 'Senha',
  editable = true,
  containerClassName = 'mb-3',
}: Props) {
  const [secure, setSecure] = useState(true);

  return (
    <View className={`relative ${containerClassName}`}>
      <TextInput
        className="rounded-xl border border-slate-300 bg-surface-light px-4 py-3 pr-20 font-regular text-base text-text-light dark:border-slate-600 dark:bg-surface-dark dark:text-text-dark"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      <Pressable
        className="absolute bottom-0 right-3 top-0 justify-center"
        onPress={() => setSecure((prev) => !prev)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={secure ? 'Mostrar senha' : 'Ocultar senha'}
      >
        <Text className="font-medium text-sm text-primary">{secure ? 'Mostrar' : 'Ocultar'}</Text>
      </Pressable>
    </View>
  );
}
