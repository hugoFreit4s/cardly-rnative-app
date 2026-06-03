import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-2xl bg-surface-light p-5 dark:bg-surface-dark">
          <Text className="font-bold text-lg text-text-light dark:text-text-dark">{title}</Text>
          <Text className="mt-2 font-regular text-base text-text-secondaryLight dark:text-text-secondaryDark">{message}</Text>
          <View className="mt-6 flex-row justify-end gap-3">
            <Pressable
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600"
              onPress={onCancel}
              disabled={busy}
            >
              <Text className="font-medium text-text-secondaryLight dark:text-text-secondaryDark">{cancelLabel}</Text>
            </Pressable>
            <Pressable className="rounded-lg bg-error px-4 py-2" onPress={onConfirm} disabled={busy}>
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-medium text-white">{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
