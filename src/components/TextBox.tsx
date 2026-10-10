import React from 'react';
import {
  DimensionValue,
  KeyboardTypeOptions,
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../hooks/themeHook';

interface TextBoxProps extends Partial<TextInputProps> {
  ref?: any;
  mode?: 'flat' | 'outlined';
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: ((text: string) => void) | undefined;
  keyboardType?: KeyboardTypeOptions | undefined;
  secureTextEntry?: boolean | undefined;
  style?: StyleProp<TextStyle>;
  outlineStyle?: StyleProp<ViewStyle>;
  width?: DimensionValue;
}

const TextBox: React.FC<TextBoxProps> = ({
  ref,
  mode,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  outlineStyle,
  style,
  width,
  ...rest
}) => {
  const { Colors } = useAppTheme();

  return (
    <TextInput
      ref={ref}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={Colors.textColor + '88'}
      cursorColor={Colors.textColor}
      style={[
        {
          backgroundColor: Colors.white,
          lineHeight: 21,
          width: width ?? '90%',
          height: 50,
          textDecorationColor: 'black',
          fontSize: 16,
          alignSelf: 'center',
          borderColor: '#CED3D7',
          borderWidth: 1,
          color: Colors.textColor,
          borderRadius: 50,
          paddingHorizontal: 20,
        },
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
};

export default TextBox;
