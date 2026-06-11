import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { DashboardPieSlice } from '../../api/types';

type Props = {
  data: DashboardPieSlice[];
};

const SLICE_COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#A855F7', '#EF4444'];

export function DashboardPieChartCard({ data }: Props) {
  const slices = data.filter((slice) => slice.value > 0);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <View className="w-full overflow-hidden rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
      <Text className="font-bold text-base text-text-light dark:text-text-dark">Distribuição dos cartões</Text>

      {total === 0 ? (
        <Text className="mt-3 text-sm text-text-secondaryLight dark:text-text-secondaryDark">
          Sem cartões para exibir no momento.
        </Text>
      ) : (
        <View className="mt-4 flex-row items-center gap-4">
          <View style={{ width: size, height: size }} className="relative shrink-0 overflow-hidden">
            <Svg width={size} height={size}>
              <Circle cx={center} cy={center} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
              {slices.map((slice, index) => {
                const sliceLength = (slice.value / total) * circumference;
                const segmentOffset = currentOffset;
                currentOffset += sliceLength;
                return (
                  <Circle
                    key={slice.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={SLICE_COLORS[index % SLICE_COLORS.length]}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    fill="none"
                    strokeDasharray={[sliceLength, circumference - sliceLength]}
                    strokeDashoffset={-segmentOffset}
                    rotation={-90}
                    originX={center}
                    originY={center}
                  />
                );
              })}
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-bold text-xl text-text-light dark:text-text-dark">{total}</Text>
              <Text className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">total</Text>
            </View>
          </View>

          <View className="min-w-0 flex-1 gap-2">
            {slices.map((slice, index) => (
              <View key={slice.key} className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                  />
                  <Text className="font-medium text-xs text-text-light dark:text-text-dark" numberOfLines={1}>
                    {slice.label}
                  </Text>
                </View>
                <Text className="shrink-0 font-bold text-xs text-text-light dark:text-text-dark">{slice.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
