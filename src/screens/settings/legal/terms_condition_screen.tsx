import SettingsLayout from '@/components/ui/settings-layout';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const TermsConditionScreen = () => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  return (
    <SettingsLayout
      heading="Terms and Conditions"
      subtitle="Please read our terms of service carefully"
      onBackPress={() => navigation.goBack()}
    >
        {/*
                <View style={{ height: 20 }} />
                <Text style={styles.textstyle}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</Text>
                <Text style={styles.textstyle}>but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Text>
                <View style={{ height: 10 }} />
                <Text style={styles.textstyle}>containing Lorem Ipsum passages, and more recently with desktop publishing software.</Text>
            */}
        <Text style={styles.textstyle1}>Introduction</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Welcome to Aura Medical Technologies Inc. (“we,” “us,” or “our”). By accessing or using our website www.AuraCoremedtech.com, our services, or products, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, please do not use our website or services.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Use of Our Services</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Eligibility</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`You must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this eligibility requirement.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Account Registration</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          To access certain features of our services, you may need to create an
          account. You agree to provide accurate, current, and complete
          information during the registration process and to update such
          information to keep it accurate, current, and complete. You are
          responsible for safeguarding your account password and for any
          activities or actions under your account. You agree to notify us
          immediately of any unauthorized use of your account.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Prohibited Activities</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>{`You agree not to:
- Use our services for any illegal or unauthorized purpose.
- Interfere with or disrupt the integrity or performance of our services.
- Attempt to gain unauthorized access to our services or related systems or networks.
- Use our services to transmit any malicious code, viruses, or harmful software.
- Engage in any activity that could damage, disable, overburden, or impair our services or interfere with any other party’s use of our services.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Intellectual Property</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Ownership</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          All content and materials on our website and services, including but
          not limited to text, graphics, logos, images, and software, are the
          property of Aura Medical Technologies Inc. or our licensors and
          are protected by copyright, trademark, and other intellectual property
          laws.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Limited License</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          We grant you a limited, non-exclusive, non-transferable, and revocable
          license to access and use our website and services for your personal,
          non-commercial use. You may not reproduce, distribute, modify, create
          derivative works of, publicly display, publicly perform, republish,
          download, store, or transmit any of the material on our website or
          services, except as authorized in these Terms.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>
          Disclaimers and Limitation of Liability
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Disclaimers</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          Our website and services are provided on an “as is” and “as available”
          basis without warranties of any kind, either express or implied,
          including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement. We do not
          warrant that our services will be uninterrupted, error-free, or free
          of viruses or other harmful components.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Limitation of Liability</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`To the fullest extent permitted by law, in no event shall Aura Medical Technologies Inc., its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your use or inability to use our services; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein; (iii) any interruption or cessation of transmission to or from our services; (iv) any bugs, viruses, trojan horses, or the like that may be transmitted to or through our services by any third party; (v) any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through our services; and/or (vi) the defamatory, offensive, or illegal conduct of any third party.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Indemnification</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          You agree to indemnify, defend, and hold harmless Aura Medical
          Technologies Inc. and its officers, directors, employees, and agents
          from and against any claims, liabilities, damages, losses, and
          expenses, including reasonable attorneys' fees, arising out of or in
          any way connected with your access to or use of our services, your
          violation of these Terms, or your infringement of any intellectual
          property or other rights of any person or entity.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>
          Governing Law and Dispute Resolution
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Governing Law</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          These Terms and your use of our services shall be governed by and
          construed in accordance with the laws of the province of Alberta,
          Canada, without regard to its conflict of law principles.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Dispute Resolution</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          Any disputes arising out of or relating to these Terms or our services
          shall be resolved through binding arbitration in accordance with the
          rules of the Canadian Arbitration Association. The arbitration shall
          take place in Edmonton, Alberta, and the language of the arbitration
          shall be English. The decision of the arbitrator shall be final and
          binding on the parties.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Changes to These Terms</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material, we will provide at
          least 30 days' notice prior to any new terms taking effect. What
          constitutes a material change will be determined at our sole
          discretion. By continuing to access or use our services after those
          revisions become effective, you agree to be bound by the revised
          Terms.
        </Text>
        <Image
          source={require('@/assets/images/AuraCore-logo-bnw.png')}
          style={styles.footerLogo}
        />
    </SettingsLayout>
  );
};

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    textstyle: {
      color: Colors.textColor,
      fontSize: 16,
      marginHorizontal: 20,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      textAlign: 'left',
      letterSpacing: 0.8,
    },
    textstyle1: {
      color: Colors.textColor,
      fontSize: 18,
      marginHorizontal: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'center',
      letterSpacing: 0.8,
    },
    textstyle2: {
      color: Colors.textColor,
      fontSize: 16,
      marginHorizontal: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'left',
      letterSpacing: 0.8,
    },
    footerLogo: {
      height: 60,
      width: 60,
      alignSelf: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
  });
};

export default TermsConditionScreen;
