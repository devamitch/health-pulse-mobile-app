export { default as BaseStyle } from './base_style';
export { default as Colors } from './colors';
export const DISCLAIMER_DATA = {
  title: '🏥 Medical Safety Notice',
  shortTitle: 'Medical Disclaimer',

  content: {
    intro:
      'This AI provides general health information for educational purposes only and cannot:',

    warnings: [
      {
        icon: 'medical-bag-off',
        text: 'Diagnose, treat, or cure any medical condition',
        type: 'critical' as const,
      },
      {
        icon: 'doctor',
        text: 'Replace professional medical advice or treatment',
        type: 'critical' as const,
      },
      {
        icon: 'shield-alert',
        text: 'Guarantee accuracy or completeness of information',
        type: 'warning' as const,
      },
      {
        icon: 'pill-off',
        text: 'Recommend specific medications or dosages',
        type: 'warning' as const,
      },
    ],

    emergency: {
      title: '🚨 Emergency Notice',
      text: 'For medical emergencies, call emergency services immediately (911, 112, etc.)',
      actions: [
        '🚑 Call emergency services',
        '🏥 Go to nearest hospital',
        '☎️ Contact your doctor',
      ],
    },

    legal:
      'By continuing, you acknowledge these limitations and agree that developers are not liable for health consequences.',
  },

  buttons: {
    accept: '✅ I Understand & Accept',
    decline: '❌ Exit App',
    showFull: '📖 Read Full Disclaimer',
    showMini: '📄 Show Summary',
  },

  settings: {
    dontShow: "Don't show again (not recommended)",
    showMini: 'Show mini reminders with AI responses',
  },

  mini: '⚕️ AI medical content. Always consult healthcare professionals.',
} as const;

export const MEDICAL_DISCLAIMER = {
  title: '🏥 Medical Information Disclaimer',
  shortTitle: 'Medical Disclaimer',

  warnings: {
    critical: '⚠️ CRITICAL SAFETY NOTICE',
    emergency: '🚨 Emergency situations require immediate professional care',
    liability: '📋 Legal & Liability Information',
  },

  content: {
    intro:
      'This AI assistant provides general health information for educational purposes only and cannot:',

    limitations: [
      {
        icon: 'medical-bag-off',
        text: 'Diagnose, treat, cure, or prevent any medical condition or disease',
        severity: 'critical',
      },
      {
        icon: 'doctor-off',
        text: 'Replace professional medical advice, diagnosis, or treatment',
        severity: 'critical',
      },
      {
        icon: 'shield-alert',
        text: 'Guarantee accuracy, completeness, or reliability of information',
        severity: 'high',
      },
      {
        icon: 'pill-off',
        text: 'Recommend specific medications, dosages, or treatments',
        severity: 'high',
      },
      {
        icon: 'baby-carriage-off',
        text: 'Provide advice for pregnancy, pediatric, or geriatric care',
        severity: 'critical',
      },
    ],

    emergency: {
      title: 'Emergency Situations',
      description:
        'If you are experiencing a medical emergency, stop using this app immediately and:',
      actions: [
        '🚑 Call your local emergency number (911, 112, etc.)',
        '🏥 Go to the nearest emergency room',
        '☎️ Contact your healthcare provider immediately',
      ],
    },

    recommendations: {
      title: 'Always Remember',
      points: [
        'Consult qualified healthcare professionals for medical concerns',
        'Never delay seeking medical attention based on AI information',
        'Inform your doctor about all symptoms and medical history',
        'Follow prescribed treatments from your healthcare provider',
      ],
    },

    liability:
      'By using this application, you acknowledge that you understand these limitations and agree that the developers are not liable for any health consequences resulting from the use of this information.',
  },

  buttons: {
    accept: '✅ I Understand & Accept Risks',
    decline: '❌ Exit Application',
    showFull: '📖 View Complete Disclaimer',
    showMini: '📄 Show Summary',
    emergency: '🚨 Emergency Contacts',
  },

  settings: {
    dontShow: "Don't show this disclaimer again (Not recommended)",
    showBefore: 'Show disclaimer before each medical query',
    miniReminder: 'Show mini reminders with AI responses',
  },

  miniText:
    '⚕️ AI-generated medical content. Always consult healthcare professionals.',
} as const;
