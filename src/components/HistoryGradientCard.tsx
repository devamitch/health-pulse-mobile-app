import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import RedirectIcon from '@/icons/redirect-icon';

interface HistoryGradientCardProps {
    colors: (string | number)[],
    text: string;
    angle?: number;
    textColor?: string;
    style?: ViewStyle;
    textComponent?: string;
    imageComponent?: React.ReactNode;
    onCartPress?: () => void;
    onLabelPress?: () => void;
}

const HistoryGradientCard: React.FC<HistoryGradientCardProps> = ({colors, text, angle = 0, textColor = 'white', style, onCartPress, imageComponent, textComponent, onLabelPress}) => {
    return (
        <LinearGradient
            useAngle={true}
            angle={angle}
            colors={colors}
            style={[styles.container, style]}
        >
            <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
                <TouchableOpacity onPress={onLabelPress} style={styles.titleContainer}>
                    <Text style={[styles.titleText, {color: textColor}]}>{text}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCartPress} style={styles.buttons}>
                    <RedirectIcon width={20} height={20} color={textColor}/>
                </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', paddingLeft: 30, position: 'relative'}}>
                <Text style={[styles.descriptionText, {color: textColor}]}>{textComponent}</Text>
                <View style={{bottom: 0, flexDirection: 'row', position: 'absolute', right: -125}}>
                    <View style={styles.component}>
                        {imageComponent}
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '90%', 
        alignSelf: 'center', 
        borderRadius: 35, 
        paddingTop: 15
    },
    buttons: {
        height: 30, 
        width: 30, 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    titleText: {
        fontSize: 18,
        fontFamily: 'Nunito-SemiBold',
        textAlign: 'center',
        alignSelf: 'center',
    },
    subtitleText: {
        paddingLeft: 30, 
        fontFamily: 'Nunito-Sans', 
        fontSize: 16, 
        paddingBottom: 10
    },
    descriptionText: {
        fontFamily: 'Nunito-Sans', 
        fontSize: 16,
        paddingBottom: 20,
        minHeight: 150,
        zIndex: 1,
        width: '75%',
    },
    circle: {
        borderColor: 'rgba(255,255,255,0.2)',
        borderTopWidth: 30, 
        borderLeftWidth: 30, 
        marginLeft: 'auto', 
        marginTop: 'auto'
    },
    component: {
        height: 125,
        width: 125,
        right: 120
    },
    titleContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginRight: 'auto', 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        borderRadius: 20, 
        marginBottom: 10,
        flexDirection: 'row',
        minWidth: '50%',
    },
    star: {
      height: 20,
      width: 20,
      marginHorizontal: 10,
    },
})

export default HistoryGradientCard