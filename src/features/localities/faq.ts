/**
 * FAQ templates per entity type, ported from the old site
 * (components/locality/LocalityFaq.jsx), in English and Hindi. `{n}` is the
 * place name. Claims the site cannot back (price bands, demand trends) are left out.
 */
import type { Locale } from '@/lib/i18n/locale';

type Q = [en: string, enA: string, hi: string, hiA: string];

const SETS: Record<string, Q[]> = {
  sector: [
    [
      'What are the circle rates in {n}?',
      'Circle rates in {n} are set by the Haryana government. They differ by use (residential, commercial, plot). Check the latest rates on the 360Ghar circle rates page before you agree a price.',
      '{n} में सर्कल रेट क्या हैं?',
      '{n} के सर्कल रेट हरियाणा सरकार तय करती है। ये उपयोग के हिसाब से अलग होते हैं (रिहायशी, कमर्शियल, प्लॉट)। कीमत तय करने से पहले 360Ghar के सर्कल रेट पेज पर ताज़ा रेट देखें।',
    ],
    [
      'Is {n} a good area to invest in?',
      '{n} is a planned sector. The answer depends on the price compared with the circle rate, the distance to your office, and the roads and metro planned nearby. Compare the live listings here before you decide.',
      'क्या {n} निवेश के लिए अच्छा है?',
      '{n} एक योजनाबद्ध सेक्टर है। जवाब कीमत और सर्कल रेट के अंतर, ऑफ़िस की दूरी और पास में बनने वाली सड़कों और मेट्रो पर निर्भर करता है। फ़ैसले से पहले यहाँ की लाइव लिस्टिंग देखें।',
    ],
    [
      'What should I check before buying in {n}?',
      'Check the RERA registration of the project, check that the plot or flat is in an approved layout, compare the circle rate with the price, and look for pending cases or loans on the property.',
      '{n} में खरीदने से पहले क्या जाँचें?',
      'प्रोजेक्ट का RERA रजिस्ट्रेशन देखें, जाँचें कि प्लॉट या फ़्लैट मंज़ूर लेआउट में है, सर्कल रेट और कीमत की तुलना करें, और प्रॉपर्टी पर कोई केस या लोन तो नहीं, यह देखें।',
    ],
    [
      'How is {n} connected to the main office hubs?',
      'Sectors in Gurugram reach Cyber City, Udyog Vihar and Golf Course Road over sector roads and the highways. Check the drive time at peak hours and the distance to the nearest metro station.',
      '{n} से बड़े ऑफ़िस इलाकों तक आना-जाना कैसा है?',
      'गुरुग्राम के सेक्टर सेक्टर रोड और हाईवे से साइबर सिटी, उद्योग विहार और गोल्फ़ कोर्स रोड से जुड़े हैं। भीड़ के समय का सफ़र और नज़दीकी मेट्रो स्टेशन की दूरी ज़रूर देखें।',
    ],
  ],
  society: [
    [
      'What amenities does {n} have?',
      'Societies in Gurugram usually have gated security, parking, power backup, green areas and a clubhouse. The list depends on the society. Check which amenities work today with the RWA or the builder.',
      '{n} में क्या सुविधाएँ हैं?',
      'गुरुग्राम की सोसाइटी में आम तौर पर सुरक्षा, पार्किंग, पावर बैकअप, हरियाली और क्लबहाउस होते हैं। सूची सोसाइटी पर निर्भर करती है। RWA या बिल्डर से पूछें कि आज कौन-सी सुविधाएँ चालू हैं।',
    ],
    [
      'What are the maintenance charges in {n}?',
      'They depend on the size of the society, the amenities, and whether the RWA has taken over from the builder. Ask the seller or the RWA for the latest maintenance bill and what it covers.',
      '{n} में मेंटेनेंस शुल्क कितना है?',
      'यह सोसाइटी के आकार, सुविधाओं और इस पर निर्भर करता है कि RWA ने बिल्डर से काम संभाला है या नहीं। विक्रेता या RWA से ताज़ा मेंटेनेंस बिल और उसमें क्या शामिल है, यह माँगें।',
    ],
    [
      'Is {n} a gated community?',
      'Most societies in Gurugram are gated, with guards and CCTV. Confirm the security and visitor rules of {n} before you decide.',
      'क्या {n} गेटेड सोसाइटी है?',
      'गुरुग्राम की ज़्यादातर सोसाइटी में गेट, गार्ड और CCTV होते हैं। फ़ैसले से पहले {n} की सुरक्षा और मेहमानों के नियम पक्के करें।',
    ],
    [
      'How is the resale market in {n}?',
      'Resale depends on the reputation of the society, the upkeep and the location. Look at how many homes are listed here and how long they stay listed.',
      '{n} में रीसेल बाज़ार कैसा है?',
      'रीसेल सोसाइटी की साख, रखरखाव और जगह पर निर्भर करता है। देखें कि यहाँ कितने घर लिस्ट हैं और वे कितने समय तक लिस्ट रहते हैं।',
    ],
  ],
  project: [
    [
      'What is the possession status of {n}?',
      '{n} may be in pre-launch, under construction or ready to move. Check the RERA registration for the promised possession date and the delay terms.',
      '{n} का पज़ेशन कब मिलेगा?',
      '{n} प्री-लॉन्च, निर्माणाधीन या रेडी-टू-मूव हो सकता है। वादा की गई पज़ेशन तारीख और देरी की शर्तें RERA रजिस्ट्रेशन में देखें।',
    ],
    [
      'Who is the builder of {n}, and what is their record?',
      'Check the builder’s delivery history, finances and RERA record before you book in {n}. Look up their other projects on the RERA projects page.',
      '{n} का बिल्डर कौन है और उसका रिकॉर्ड कैसा है?',
      '{n} में बुकिंग से पहले बिल्डर का डिलीवरी इतिहास, वित्तीय हालत और RERA रिकॉर्ड देखें। उनके दूसरे प्रोजेक्ट RERA प्रोजेक्ट पेज पर देखें।',
    ],
    [
      'Is {n} RERA registered?',
      'Every real estate project in Haryana must be registered with H-RERA. Check the RERA number of {n} on the official H-RERA portal, and check the approved plans and any complaints.',
      'क्या {n} RERA में रजिस्टर्ड है?',
      'हरियाणा का हर रियल एस्टेट प्रोजेक्ट H-RERA में रजिस्टर होना चाहिए। {n} का RERA नंबर आधिकारिक H-RERA पोर्टल पर देखें, और मंज़ूर नक्शे और शिकायतें भी जाँचें।',
    ],
    [
      'What payment plans are there for {n}?',
      'Builders often offer construction-linked, possession-linked or down-payment plans. Compare the full cost under each plan: PLC, EDC and IDC, club membership and the maintenance deposit.',
      '{n} के लिए कौन-से पेमेंट प्लान हैं?',
      'बिल्डर अक्सर निर्माण से जुड़े, पज़ेशन से जुड़े या डाउन-पेमेंट प्लान देते हैं। हर प्लान में पूरी लागत देखें: PLC, EDC और IDC, क्लब मेंबरशिप और मेंटेनेंस डिपॉज़िट।',
    ],
  ],
  township: [
    [
      'What is the development status of {n}?',
      '{n} is built in phases. Some phases may be delivered and others still under construction. Check the status of your phase, the amenities that work, and the roads still pending.',
      '{n} का विकास कहाँ तक पहुँचा है?',
      '{n} कई फ़ेज़ में बनता है। कुछ फ़ेज़ तैयार हो सकते हैं और कुछ अभी बन रहे हैं। अपने फ़ेज़ की स्थिति, चालू सुविधाएँ और बाकी सड़कें जाँचें।',
    ],
    [
      'Does {n} have shops and offices inside?',
      'Townships usually set aside land for shops and offices. Check the master plan of {n} to see what is planned and what is open today.',
      'क्या {n} के अंदर दुकानें और ऑफ़िस हैं?',
      'टाउनशिप में आम तौर पर दुकानों और ऑफ़िस के लिए ज़मीन रखी जाती है। {n} का मास्टर प्लान देखें कि क्या योजना में है और आज क्या खुला है।',
    ],
    [
      'Is {n} good for families?',
      'Check the schools, hospitals, parks and community spaces in and around {n}. Phased projects add facilities over time, so confirm what works today.',
      'क्या {n} परिवारों के लिए अच्छा है?',
      '{n} के अंदर और आस-पास स्कूल, अस्पताल, पार्क और सामुदायिक जगहें देखें। फ़ेज़ वाले प्रोजेक्ट में सुविधाएँ धीरे-धीरे आती हैं, इसलिए पक्का करें कि आज क्या चालू है।',
    ],
    [
      'How should I compare {n} with other townships?',
      'Compare the price per sq ft of carpet area, the maintenance charges, the amenities that work, the builder’s record and the distance to your office.',
      '{n} की तुलना दूसरी टाउनशिप से कैसे करें?',
      'कारपेट एरिया की प्रति वर्ग फ़ुट कीमत, मेंटेनेंस शुल्क, चालू सुविधाएँ, बिल्डर का रिकॉर्ड और ऑफ़िस की दूरी की तुलना करें।',
    ],
  ],
  road: [
    [
      'What are the pros of living on {n}?',
      'Homes on {n} are close to shops, bus and metro stops and office areas. The cost is more traffic and noise: higher floors and flats set back from the road are quieter.',
      '{n} पर रहने के क्या फ़ायदे हैं?',
      '{n} के घर दुकानों, बस और मेट्रो स्टॉप और ऑफ़िस इलाकों के पास होते हैं। कीमत है ज़्यादा ट्रैफ़िक और शोर: ऊँची मंज़िल और सड़क से पीछे बने फ़्लैट शांत रहते हैं।',
    ],
    [
      'How noisy is {n}?',
      'Main roads in Gurugram are busy at peak hours. Look for higher floors or flats facing away from the road, and visit at rush hour to judge for yourself.',
      '{n} पर शोर कितना है?',
      'गुरुग्राम की मुख्य सड़कें भीड़ के समय व्यस्त रहती हैं। ऊँची मंज़िल या सड़क से उलटी तरफ़ के फ़्लैट देखें, और भीड़ के समय जाकर खुद परखें।',
    ],
    [
      'Are there commercial properties on {n}?',
      'Roads in Gurugram often have mixed use, with shops, showrooms and offices on the ground floor. Ask the 360Ghar team for listings on {n}.',
      'क्या {n} पर कमर्शियल प्रॉपर्टी हैं?',
      'गुरुग्राम की सड़कों पर अक्सर मिला-जुला उपयोग होता है, नीचे दुकानें, शोरूम और ऑफ़िस। {n} की लिस्टिंग के लिए 360Ghar टीम से पूछें।',
    ],
    [
      'What should I check before renting on {n}?',
      'Check parking, water supply, power backup and the upkeep of the building. Road-facing homes can get dust and noise: check the window seals and the floor.',
      '{n} पर किराये से पहले क्या जाँचें?',
      'पार्किंग, पानी, पावर बैकअप और बिल्डिंग का रखरखाव देखें। सड़क की तरफ़ के घरों में धूल और शोर आ सकता है: खिड़कियों की सील और मंज़िल देखें।',
    ],
  ],
  default: [
    [
      'Is {n} good for a long stay or an investment?',
      'Look at your budget, how long you plan to stay, and the quality of the homes on offer. Compare the live listings here with nearby areas before you decide.',
      'क्या {n} लंबे समय रहने या निवेश के लिए अच्छा है?',
      'अपना बजट, रहने की अवधि और मिल रहे घरों की क्वालिटी देखें। फ़ैसले से पहले यहाँ की लाइव लिस्टिंग की तुलना पास के इलाकों से करें।',
    ],
    [
      'How should I compare homes in {n}?',
      'Compare the build quality, the builder’s record, the roads and transport, and the rent or resale demand. Visit the homes you like before you negotiate.',
      '{n} में घरों की तुलना कैसे करें?',
      'बनावट की क्वालिटी, बिल्डर का रिकॉर्ड, सड़क और परिवहन, और किराये या रीसेल की माँग की तुलना करें। मोलभाव से पहले पसंद के घर देखने जाएँ।',
    ],
    [
      'What should families check here?',
      'Check the schools, hospitals, safety and daily shopping nearby. Also time the drive to work at peak hours.',
      'परिवार यहाँ क्या जाँचें?',
      'पास के स्कूल, अस्पताल, सुरक्षा और रोज़ की खरीदारी देखें। भीड़ के समय ऑफ़िस तक का सफ़र भी जाँचें।',
    ],
    [
      'How do I pick the right street in {n}?',
      'Walk the streets: traffic, access roads, noise and the upkeep of the buildings differ a lot. Shortlist two or three homes and compare them before you negotiate.',
      '{n} में सही गली कैसे चुनें?',
      'गलियों में पैदल घूमें: ट्रैफ़िक, पहुँच की सड़कें, शोर और इमारतों का रखरखाव काफ़ी अलग होता है। दो-तीन घर चुनकर मोलभाव से पहले तुलना करें।',
    ],
  ],
};

const SET_FOR: Record<string, string> = { sector: 'sector', society: 'society', project: 'project', township: 'township', phase: 'township', road: 'road' };

export const localityFaqs = (name: string, entityType: string, locale: Locale = 'en'): { question: string; answer: string }[] => {
  const set = SETS[SET_FOR[(entityType || '').toLowerCase()] ?? 'default']!;
  const fill = (s: string) => s.replaceAll('{n}', name);
  return set.map(([q, a, hq, ha]) => (locale === 'hi' ? { question: fill(hq), answer: fill(ha) } : { question: fill(q), answer: fill(a) }));
};
