import Svg, { Path, Rect } from 'react-native-svg';

type CardlyLogoProps = {
  width?: number;
  height?: number;
  color?: string;
  accentColor?: string;
};

export function CardlyLogo({
  width = 120,
  height = 120,
  color = '#1E3A5F',
  accentColor = '#0F766E',
}: CardlyLogoProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      accessibilityLabel="Cardly logo"
      accessibilityRole="image"
    >
      <Rect x="18" y="22" width="84" height="76" rx="14" fill={color} />
      <Path
        d="M60 36 L50 58 H60 L55 80 L70 55 H60 L65 36 Z"
        fill={accentColor}
      />
    </Svg>
  );
}
