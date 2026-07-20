import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getShopSvgXml } from '../shopSvgs';

interface ShopItemImageProps {
  imageUrl?: string;
  name: string;
  style?: StyleProp<ImageStyle>;
}

export const ShopItemImage = ({ imageUrl, name, style }: ShopItemImageProps) => {
  const svgXml = getShopSvgXml(imageUrl);

  if (svgXml) {
    return (
      <View style={[styles.image, style as StyleProp<ViewStyle>]} accessibilityLabel={name}>
        <SvgXml xml={svgXml} width="100%" height="100%" />
      </View>
    );
  }

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[styles.image, style]} resizeMode="contain" accessibilityLabel={name} />;
  }

  return null;
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
