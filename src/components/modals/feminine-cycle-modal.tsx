import { ColorScheme } from "@/constants/theme";
import BaseModal from "./base-modal";
import { StyleSheet, Text, View } from "react-native";
import Button from "../ui/buttons/button";

interface FeminineCycleModalProps{
    visible: boolean;
    onClose: () => void;
    dateString: string;
    Colors: ColorScheme;
    onYes: () => void;
    onNo: () => void;
}

const FeminineCycleModal: React.FC<FeminineCycleModalProps> = ({
    visible,
    onClose,
    dateString,
    Colors,
    onYes,
    onNo,
}) => {
    const styles = createStyle(Colors);

    return(
        <BaseModal 
            isVisible={visible} 
            onClose={onClose} 
            title={"Confirmation"}
        >
            <Text style={styles.modalText}>
                {`Could you please confirm if\n ${new Date(
                    dateString,
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })} is correct`
                 }
            </Text>
            <View style={styles.buttonContainer}>
                <Button
                    text="Yes"
                    variant="contained"
                    onPress={onYes}
                    style={styles.buttonStyle}
                    textStyle={styles.buttonLabelStyle}
                />
                <Button
                    text="No"
                    variant="contained"
                    onPress={onNo}
                    style={[styles.buttonStyle, { backgroundColor: Colors.secondaryColor }]}
                    textStyle={styles.buttonLabelStyle}
                />
            </View>
        </BaseModal>
    )
}

const createStyle = (Colors: ColorScheme) => 
    StyleSheet.create({
        modalText: {
            fontSize: 16, // Text size
            fontFamily: 'Inter-Medium', // Custom font (if applicable)
            color: Colors.textColor, // Text color
            textAlign: 'center',
            marginBottom: 15,
        },
        modalTextContainer: {
            width: '100%',
            backgroundColor: Colors.greyColor,
            padding: 12,
            marginBottom: 16,
            borderRadius: 12,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        buttonLabelStyle: {
            fontFamily: 'Nunito-Bold',
        },
        buttonStyle: {
            width: '40%',
        }
    })

export default FeminineCycleModal;