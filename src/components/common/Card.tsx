/**
 * Componente Card personalizado para AutoCare Pro
 */
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
} from 'react-native';
import { Colors, Theme } from '../../constants/Colors';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: number;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 2,
  padding = 'medium',
  ...touchableProps
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: Theme.spacing.sm };
      case 'medium':
        return { padding: Theme.spacing.md };
      case 'large':
        return { padding: Theme.spacing.lg };
      default:
        return { padding: Theme.spacing.md };
    }
  };

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      elevation,
      shadowOpacity: elevation * 0.05,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowRadius: elevation * 2,
    },
    getPaddingStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.9}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: Colors.secondary,
    marginVertical: Theme.spacing.xs,
  },
});

export default Card;
