/**
 * Neutral FAQ templates per entity type, in English and Hindi. `{n}` is the
 * place name. The answers do not claim that this page verifies local facts.
 */
import type { Locale } from '@/lib/i18n/locale';

type Q = [en: string, enA: string, hi: string, hiA: string];

const SETS: Record<string, Q[]> = {
  sector: [
    [
      'How can I see current listings in {n}?',
      'Browse the current 360Ghar listings for this place. Availability and asking prices can change, so confirm details with the advertiser.',
      '{n} में मौजूदा लिस्टिंग कैसे देखें?',
      'इस जगह की मौजूदा 360Ghar लिस्टिंग देखें। उपलब्धता और माँगी गई कीमत बदल सकती है, इसलिए विज्ञापनदाता से जानकारी पक्की करें।',
    ],
    [
      'How should I compare homes in {n}?',
      'Compare the written cost, title papers, services and condition. Visit each home and get professional advice for questions you cannot verify.',
      '{n} में घरों की तुलना कैसे करें?',
      'लिखित लागत, मालिकाना काग़ज़, सेवाओं और स्थिति की तुलना करें। हर घर पर जाएँ और जिन बातों की पुष्टि न कर सकें, उनके लिए पेशेवर सलाह लें।',
    ],
    [
      'What should I check before buying in {n}?',
      'Check official records for the approvals that apply to the property. This page does not verify them. Consider advice from an independent property lawyer.',
      '{n} में खरीदने से पहले क्या जाँचें?',
      'प्रॉपर्टी पर लागू मंज़ूरियों के आधिकारिक रिकॉर्ड देखें। यह पेज उनकी पुष्टि नहीं करता। किसी स्वतंत्र प्रॉपर्टी वकील से सलाह लेने पर विचार करें।',
    ],
    [
      'How can I check travel times from {n}?',
      'Use a current route service and check the route at the time you expect to travel. Travel times and road conditions can change.',
      '{n} से सफ़र का समय कैसे जाँचें?',
      'मौजूदा रूट सेवा देखें और उस समय का रास्ता जाँचें जब आप सफ़र करेंगे। सफ़र का समय और सड़क की स्थिति बदल सकती है।',
    ],
  ],
  society: [
    [
      'Which amenities are available in {n}?',
      'Amenities vary by building and may change. Ask the seller or managing body for a current written list, then confirm it during a visit.',
      '{n} में कौन-सी सुविधाएँ उपलब्ध हैं?',
      'सुविधाएँ बिल्डिंग के हिसाब से अलग होती हैं और बदल सकती हैं। विक्रेता या प्रबंधन से मौजूदा लिखित सूची माँगें और फिर जाकर पुष्टि करें।',
    ],
    [
      'How can I check maintenance charges in {n}?',
      'Ask for the latest written bill, what it covers and any unpaid or one-time charges. Confirm the details with the seller or managing body.',
      '{n} में मेंटेनेंस शुल्क कैसे जाँचें?',
      'ताज़ा लिखित बिल, उसमें शामिल मदें और बकाया या एकमुश्त शुल्क माँगें। विक्रेता या प्रबंधन से जानकारी पक्की करें।',
    ],
    [
      'How can I check security arrangements in {n}?',
      'This page does not verify security features. Ask the managing body about access and visitor rules, and check them during a visit.',
      '{n} में सुरक्षा की व्यवस्था कैसे जाँचें?',
      'यह पेज सुरक्षा सुविधाओं की पुष्टि नहीं करता। प्रवेश और मेहमानों के नियम प्रबंधन से पूछें और जाकर जाँचें।',
    ],
    [
      'Where can I find transaction information for {n}?',
      'This page does not publish verified transaction figures. Check reliable primary records where available and request supporting documents.',
      '{n} के लेन-देन की जानकारी कहाँ मिलेगी?',
      'यह पेज सत्यापित लेन-देन के आँकड़े नहीं देता। जहाँ उपलब्ध हों, विश्वसनीय प्राथमिक रिकॉर्ड देखें और सहायक दस्तावेज़ माँगें।',
    ],
  ],
  project: [
    [
      'How can I check the status and possession date of {n}?',
      'This page does not verify project status or possession dates. Check current official project records and the signed agreement for the relevant phase.',
      '{n} की स्थिति और पज़ेशन तारीख कैसे जाँचें?',
      'यह पेज प्रोजेक्ट की स्थिति या पज़ेशन तारीख की पुष्टि नहीं करता। संबंधित फ़ेज़ के मौजूदा आधिकारिक प्रोजेक्ट रिकॉर्ड और हस्ताक्षरित समझौता देखें।',
    ],
    [
      'How can I check the builder’s record for {n}?',
      'This page does not provide a verified builder rating or history. Review official filings and project records, and get independent advice.',
      '{n} के बिल्डर का रिकॉर्ड कैसे जाँचें?',
      'यह पेज बिल्डर की सत्यापित रेटिंग या इतिहास नहीं देता। आधिकारिक फाइलिंग और प्रोजेक्ट रिकॉर्ड देखें और स्वतंत्र सलाह लें।',
    ],
    [
      'Where can I check official records for {n}?',
      'Use the official portal of the authority that applies to this project. This page does not verify any registration, approval or complaint record.',
      '{n} के आधिकारिक रिकॉर्ड कहाँ जाँचें?',
      'इस प्रोजेक्ट पर लागू प्राधिकरण का आधिकारिक पोर्टल देखें। यह पेज किसी रजिस्ट्रेशन, मंज़ूरी या शिकायत रिकॉर्ड की पुष्टि नहीं करता।',
    ],
    [
      'How should I compare payment terms for {n}?',
      'Ask for the full written payment schedule and every additional charge. Compare the total cost and have unclear terms reviewed before you sign.',
      '{n} की भुगतान शर्तों की तुलना कैसे करें?',
      'पूरा लिखित भुगतान शेड्यूल और हर अतिरिक्त शुल्क माँगें। कुल लागत की तुलना करें और हस्ताक्षर से पहले अस्पष्ट शर्तों की जाँच करवाएँ।',
    ],
  ],
  township: [
    [
      'How can I check the status of each phase in {n}?',
      'Check current official project records for the phase you are considering. This page does not verify construction, handover or facility status.',
      '{n} के हर फ़ेज़ की स्थिति कैसे जाँचें?',
      'जिस फ़ेज़ पर विचार कर रहे हैं, उसके मौजूदा आधिकारिक प्रोजेक्ट रिकॉर्ड देखें। यह पेज निर्माण, हैंडओवर या सुविधाओं की स्थिति की पुष्टि नहीं करता।',
    ],
    [
      'How can I check which services are operating in {n}?',
      'Do not rely on a plan alone. Check the current official records and visit to confirm what is open and operating.',
      '{n} में कौन-सी सेवाएँ चालू हैं, यह कैसे जाँचें?',
      'सिर्फ़ योजना पर भरोसा न करें। मौजूदा आधिकारिक रिकॉर्ड देखें और जाकर पुष्टि करें कि क्या खुला और चालू है।',
    ],
    [
      'How can I check nearby services around {n}?',
      'Use current sources for schools, health services and transport, then visit the places that matter to you. This page does not verify their distance or availability.',
      '{n} के आस-पास की सेवाएँ कैसे जाँचें?',
      'स्कूल, स्वास्थ्य सेवाओं और परिवहन के लिए मौजूदा स्रोत देखें, फिर अपनी ज़रूरत की जगहों पर जाएँ। यह पेज उनकी दूरी या उपलब्धता की पुष्टि नहीं करता।',
    ],
    [
      'How should I compare {n} with another project?',
      'Compare written costs, area measurements, current charges and official project records. Visit both places and check the route at your usual travel time.',
      '{n} की तुलना दूसरे प्रोजेक्ट से कैसे करें?',
      'लिखित लागत, क्षेत्रफल के माप, मौजूदा शुल्क और आधिकारिक प्रोजेक्ट रिकॉर्ड की तुलना करें। दोनों जगह जाएँ और अपने सामान्य सफ़र के समय रास्ता जाँचें।',
    ],
  ],
  road: [
    [
      'What should I check before choosing a home on {n}?',
      'Visit at the times you expect to travel. Check the entrance, access, noise and building condition in person.',
      '{n} पर घर चुनने से पहले क्या जाँचें?',
      'जिन समयों पर आप सफ़र करेंगे, उन समयों पर जाएँ। प्रवेश, पहुँच, शोर और बिल्डिंग की स्थिति खुद देखें।',
    ],
    [
      'How can I judge noise on {n}?',
      'Noise can vary by time and building. Visit at different times and ask people who live or work nearby.',
      '{n} पर शोर का अंदाज़ा कैसे लगाएँ?',
      'शोर समय और बिल्डिंग के हिसाब से बदल सकता है। अलग-अलग समय पर जाएँ और आस-पास रहने या काम करने वालों से पूछें।',
    ],
    [
      'How can I check permitted commercial use on {n}?',
      'Check the official local planning records. This page does not verify land use or permissions.',
      '{n} पर कमर्शियल उपयोग की अनुमति कैसे जाँचें?',
      'स्थानीय योजना के आधिकारिक रिकॉर्ड देखें। यह पेज ज़मीन के उपयोग या अनुमति की पुष्टि नहीं करता।',
    ],
    [
      'What should I check before renting on {n}?',
      'Review the written lease, payment terms, utilities and home condition. Record any repair or service commitments before you sign.',
      '{n} पर किराये से पहले क्या जाँचें?',
      'लिखित किरायानामा, भुगतान शर्तें, सुविधाएँ और घर की स्थिति देखें। हस्ताक्षर से पहले मरम्मत या सेवा के वादे लिखवा लें।',
    ],
  ],
  default: [
    [
      'What should I consider before choosing a home in {n}?',
      'Compare your budget, needs and the written terms for each home. Visit in person and verify the documents that apply.',
      '{n} में घर चुनने से पहले क्या सोचें?',
      'अपना बजट, ज़रूरतें और हर घर की लिखित शर्तें देखें। खुद जाकर उन दस्तावेज़ों की पुष्टि करें जो लागू होते हैं।',
    ],
    [
      'How should I compare homes in {n}?',
      'Compare the home condition, written costs, services and route. Visit the homes you like and verify the details before you negotiate.',
      '{n} में घरों की तुलना कैसे करें?',
      'घर की स्थिति, लिखित लागत, सेवाओं और रास्ते की तुलना करें। मोलभाव से पहले पसंद के घर देखें और जानकारी की पुष्टि करें।',
    ],
    [
      'How can I check nearby services?',
      'Use current sources for schools, health services and transport. Visit the places you plan to use and check the route at your usual travel time.',
      'आस-पास की सेवाएँ कैसे जाँचें?',
      'स्कूल, स्वास्थ्य सेवाओं और परिवहन के लिए मौजूदा स्रोत देखें। जिन जगहों का उपयोग करेंगे वहाँ जाएँ और अपने सामान्य सफ़र के समय रास्ता जाँचें।',
    ],
    [
      'How do I pick the right street in {n}?',
      'Visit at different times and check access, noise and building condition. Compare the homes and written terms before you negotiate.',
      '{n} में सही गली कैसे चुनें?',
      'अलग-अलग समय पर जाएँ और पहुँच, शोर तथा बिल्डिंग की स्थिति देखें। मोलभाव से पहले घरों और लिखित शर्तों की तुलना करें।',
    ],
  ],
};

const SET_FOR: Record<string, string> = { sector: 'sector', society: 'society', project: 'project', township: 'township', phase: 'township', road: 'road' };

export const localityFaqs = (name: string, entityType: string, locale: Locale = 'en'): { question: string; answer: string }[] => {
  const set = SETS[SET_FOR[(entityType || '').toLowerCase()] ?? 'default']!;
  const fill = (s: string) => s.replaceAll('{n}', name);
  return set.map(([q, a, hq, ha]) => (locale === 'hi' ? { question: fill(hq), answer: fill(ha) } : { question: fill(q), answer: fill(a) }));
};
