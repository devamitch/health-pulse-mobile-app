import SettingsLayout from '@/components/ui/settings-layout';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ColorScheme } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  return (
    <SettingsLayout
      heading="Privacy Policy"
      onBackPress={() => navigation.goBack()}
      subtitle='How AuraCore handles your data'
    >
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Introduction</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Aura Medical Technologies Inc. (“we,” “us,” or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.AuraCoremedtech.com, use our services, or interact with us. By using our website and services, you agree to the terms of this Privacy Policy.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle1}>Information We Collect</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Personal Data</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`While using our website or services, we may ask you to provide us with certain personally identifiable information, including but not limited to:
- Name
- Email address
- Phone number
- Address
- Date of birth
- Payment information (if applicable)`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Usage Data</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`We may collect information on how the service is accessed and used, including but not limited to:
- Internet Protocol (IP) address
- Browser type
- Browser version
- Pages of our website that you visit
- Time and date of your visit
- Time spent on those pages
- Unique device identifiers
- Other diagnostic data`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Tracking Technologies and Cookies</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          We use cookies and similar tracking technologies to track the activity
          on our website and store certain information. Tracking technologies
          used are beacons, tags, and scripts to collect and track information
          and to improve and analyze our website. You can instruct your browser
          to refuse all cookies or to indicate when a cookie is being sent.
          However, if you do not accept cookies, you may not be able to use some
          portions of our website.
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>Types of Cookies We Use:</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Essential Cookies: These cookies are necessary for the website to function and cannot be switched off in our systems.
Performance and Analytics Cookies: These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our website.
Functionality Cookies: These cookies enable the website to provide enhanced functionality and personalization.
Advertising and Targeting Cookies: These cookies may be set through our website by our advertising partners to build a profile of your interests and show you relevant ads on other sites.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>How We Use Your Data</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          We use the information we collect in a variety of ways to provide and
          improve our services to you. These include:
        </Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>
          To Provide and Maintain Our Services
        </Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Account Management: To create and manage your account, including processing your registration.
Service Delivery: To deliver the products and services you request, including processing transactions and sending related information such as confirmations and invoices.
Customer Support: To provide customer support and respond to your inquiries, including investigating and addressing your concerns and monitoring and improving our responses.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>To Improve Our Services</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Enhancement: To understand and analyze how you use our services so we can develop new products, services, features, and functionality.
Personalization: To personalize your experience and deliver content and product offerings relevant to your interests, including targeted offers and ads through our website and third-party sites.
Performance Monitoring: To monitor and analyze usage and activity trends to improve the functionality of our website and services.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>To Communicate with You</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Updates and Notifications: To send you technical notices, updates, security alerts, and support and administrative messages.
Marketing and Promotional Activities: To communicate with you about products, services, offers, promotions, and events we think may interest you. You can opt-out of receiving these communications at any time.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>To Ensure Compliance and Security</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Legal Obligations: To comply with applicable laws, regulations, and legal processes.
Security: To protect, investigate, and deter against fraudulent, unauthorized, or illegal activity, and to ensure the security of our website and services.
Enforcement: To enforce our terms, conditions, and policies, and to respond to legal requests and prevent harm.`}</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle2}>To Aggregate and Anonymize Data</Text>
        <View style={{ height: 20 }} />
        <Text
          style={styles.textstyle}
        >{`Research and Analysis: To produce aggregated insights that do not identify you, for research and analysis purposes to understand trends and improve our services.
Product Development: To develop new features and products that are informed by the aggregated data.`}</Text>
        <View style={{ height: 20 }} />
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

export default PrivacyPolicyScreen;
