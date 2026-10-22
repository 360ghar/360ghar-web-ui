/**
 * Post (or edit) a property: six short steps, validated per step with the
 * backend's own rules. The draft is kept in sessionStorage, so signing in on
 * the last step does not lose it. Photos upload to POST /api/v1/upload/batch.
 * Edit mode: /post-property?edit=<id> loads the listing and saves with PUT.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { useForm, useWatch, type FieldPath } from 'react-hook-form';
import { HouseProgress, noPhotoUrl, Vignette } from '@/features/account/AccountArt';
import { Segmented } from '@/ui/react/Segmented';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { useAuth } from '@/features/auth/useAuth';
import { PropertyCardView } from '@/features/property/PropertyCardView';
import { PlacesInput } from '@/features/search/PlacesInput';
import { api, call, multipart, timeoutMs, UPLOAD_TIMEOUT_MS } from '@/lib/api/client';
import { fetchAmenities } from '@/lib/api/amenities';
import { ApiError, applyFieldErrors, describeError } from '@/lib/api/errors';
import type { Amenity, Property } from '@/lib/api/types';
import { homeKind, listingPrice, typeLabel } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { Check, SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { StateBlock } from '@/ui/states/StateBlock';
import { KITCHEN_TYPES, SHARING_TYPES, VENTILATION_TYPES } from '@/lib/api/enums';
import { AI_OWNER_TOOLS } from '@/lib/flags';
import { listingDetails } from './ai';
import { ListingWriter, StageControl, stageNote } from './OwnerAi';
import { NO_ROOMS, RENT_ONLY, STEPS, TYPES, crossIssues, formSchema, makeFormSchema, formNum, suggestTitle, toCard, toPayload, toUpdatePayload, type FormIn, type FormOut } from './schema';

const DRAFT = '360ghar:post-draft';
const STAGED = '360ghar:post-staged';

const T = {
  en: {
    steps: ['What', 'Where', 'Details', 'Price', 'Photos', 'Contact'],
    stepOf: (i: number, n: number, name: string) => `Step ${i} of ${n}: ${name}`,
    purpose: 'I want to',
    sell: 'Sell',
    rentOut: 'Rent out',
    short: 'Short stay',
    type: 'Property type',
    address: 'Full address',
    addressHint: 'House or flat number, building, street.',
    search: 'Find the place on the map',
    locality: 'Locality or sector',
    city: 'City',
    pincode: 'PIN code',
    landmark: 'Landmark',
    optional: '(optional)',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    balconies: 'Balconies',
    parking: 'Parking spaces',
    area: 'Area (sq ft)',
    areaType: 'Area type',
    areaTypes: ['Carpet Area', 'Built-up Area', 'Super Built-up Area', 'Plot Area'],
    floor: 'Floor',
    floors: 'Total floors',
    age: 'Age (years)',
    furnishing: 'Furnishing',
    furnished: 'Furnished',
    semi: 'Semi-furnished',
    unfurnished: 'Unfurnished',
    availableFrom: 'Available from',
    amenities: 'Amenities',
    moreAmenities: (n: number, picked: number) => `${n} more amenities${picked ? ` (${picked} selected)` : ''}`,
    ownerFixed: 'The owner name and phone cannot be changed here. Call 360Ghar to change them.',
    salePrice: 'Price (₹)',
    rent: 'Monthly rent (₹)',
    daily: 'Price per night (₹)',
    deposit: 'Security deposit (₹)',
    maintenance: 'Maintenance per month (₹)',
    setupCost: 'Setup cost (₹)',
    otherCharges: 'Other charges (₹)',
    otherChargesFor: 'What the other charges are for',
    pgTitle: 'About the room',
    pgLead: 'Tell people who the room suits.',
    gender: 'Open to',
    genderAny: 'Anyone',
    male: 'Men',
    female: 'Women',
    sharing: 'Room type',
    private_room: 'Private room',
    shared_room: 'Shared room',
    master_bedroom: 'Master bedroom',
    entire_flat: 'Entire flat',
    kitchen: 'Kitchen rules',
    kitchenOptions: { vegetarian: 'Vegetarian', non_vegetarian: 'Non-vegetarian', eggetarian: 'Eggetarian', any: 'No restriction' },
    ventilation: 'Ventilation',
    ventilationOptions: { good: 'Good', average: 'Average', poor: 'Poor' },
    windows: 'Windows',
    maxPeople: 'Most people who can stay',
    notSet: '–',
    photos: 'Photos',
    photosHint: 'Up to 20 photos. The first photo is the cover. JPEG, PNG or WebP.',
    addPhotos: 'Add photos',
    uploading: 'Uploading…',
    cover: 'Cover',
    makeCover: 'Make cover',
    removePhoto: 'Remove photo',
    signInPhotos: 'Sign in to add photos. You can also add them later.',
    signIn: 'Sign in',
    title: 'Listing title',
    suggest: 'Use a suggested title',
    description: 'Description',
    descHint: 'What makes this home good to live in? Light, view, neighbours, commute.',
    ownerName: 'Your name',
    ownerPhone: 'Your mobile number',
    terms: ['I own this property or have the right to list it. I accept the ', 'terms of service', ' and the ', 'privacy policy', '. The 360Ghar team will call me about the listing.'],
    back: 'Back',
    next: 'Continue',
    submit: 'Post my property',
    save: 'Save changes',
    submitting: 'Posting…',
    signInToPost: 'Sign in to post',
    doneTitle: 'Your property is posted',
    doneBody: 'Our team will review the details and call you within 24 hours.',
    view: 'See the listing',
    another: 'Post another property',
    savedTitle: 'Changes saved',
    inReview: 'This PG or flatmate listing is in review. It shows on the site again once our team approves it.',
    loadError: 'We could not load this listing to edit.',
    retry: 'Try again',
    notOwner: 'You can only edit your own listings.',
    draftRestored: 'We restored your draft.',
    clearDraft: 'Start over',
    draftSaved: 'Draft saved on this device',
    stepsLabel: 'Steps',
    goTo: (name: string) => `Go back to ${name}`,
    stepLead: [
      'Tell us what you are listing.',
      'Where is the home? Add the locality so people can find it.',
      'Rooms, size and floor. Fill in what you know.',
      'Your asking price, and the deposit if you rent it out.',
      'Clear photos of every room. The first photo is the cover.',
      'A title, a few lines about the home, and how we reach you.',
    ],
    dropHint: 'or drop photos here',
    dropNow: 'Drop the photos to add them',
    moveEarlier: 'Move photo earlier',
    moveLater: 'Move photo later',
    reorderHint: 'Drag a photo to change the order, or use the arrows.',
    skipped: (n: number) => (n === 1 ? '1 file was skipped. Use JPEG, PNG or WebP, up to 50 MB.' : `${n} files were skipped. Use JPEG, PNG or WebP, up to 50 MB.`),
    tooMany: 'You can add up to 20 photos. The extra files were not added.',
    tooBig: 'These photos are too large to upload at once. The last ones were not added. Add them after this batch.',
    someFailed: (n: number) => (n === 1 ? '1 photo could not be uploaded.' : `${n} photos could not be uploaded.`),
    photoN: (i: number, n: number) => `Photo ${i} of ${n}`,
    previewTitle: 'How it will look',
    previewLead: 'Your card in the search results.',
    previewEmpty: 'Choose the type of property to see your card.',
    peek: 'Preview your card',
    pricePh: 'Price not added yet',
    tipsTitle: 'Make it stronger',
    tipPhotos: 'Add photos',
    tipArea: 'Add the area',
    tipAmenities: 'Pick the amenities',
    tipDesc: 'Write a short description',
    allSet: 'Your listing has the main details.',
    nextTitle: 'What happens next',
    nextSteps: [
      ['Our team checks the details', 'We call you within 24 hours.'],
      ['We photograph it in 360°', 'Then we verify the listing.'],
      ['You manage it from your account', 'Edit it, add photos or remove it in My listings.'],
    ],
    myListings: 'Go to My listings',
  },
  hi: {
    steps: ['क्या', 'कहाँ', 'विवरण', 'कीमत', 'फ़ोटो', 'संपर्क'],
    stepOf: (i: number, n: number, name: string) => `चरण ${i} / ${n}: ${name}`,
    purpose: 'मैं चाहता/चाहती हूँ',
    sell: 'बेचना',
    rentOut: 'किराये पर देना',
    short: 'कम समय के लिए',
    type: 'प्रॉपर्टी का प्रकार',
    address: 'पूरा पता',
    addressHint: 'मकान या फ़्लैट नंबर, बिल्डिंग, गली।',
    search: 'मैप पर जगह खोजें',
    locality: 'लोकेलिटी या सेक्टर',
    city: 'शहर',
    pincode: 'पिन कोड',
    landmark: 'पास की पहचान',
    optional: '(वैकल्पिक)',
    bedrooms: 'बेडरूम',
    bathrooms: 'बाथरूम',
    balconies: 'बालकनी',
    parking: 'पार्किंग',
    area: 'एरिया (वर्ग फ़ुट)',
    areaType: 'एरिया का प्रकार',
    areaTypes: ['Carpet Area', 'Built-up Area', 'Super Built-up Area', 'Plot Area'],
    floor: 'फ़्लोर',
    floors: 'कुल फ़्लोर',
    age: 'उम्र (साल)',
    furnishing: 'फ़र्निशिंग',
    furnished: 'फ़र्निश्ड',
    semi: 'सेमी-फ़र्निश्ड',
    unfurnished: 'अनफ़र्निश्ड',
    availableFrom: 'कब से उपलब्ध',
    amenities: 'सुविधाएँ',
    moreAmenities: (n: number, picked: number) => `${n} और सुविधाएँ${picked ? ` (${picked} चुनी गईं)` : ''}`,
    ownerFixed: 'मालिक का नाम और फ़ोन यहाँ नहीं बदले जा सकते। बदलने के लिए 360Ghar को कॉल करें।',
    salePrice: 'कीमत (₹)',
    rent: 'मासिक किराया (₹)',
    daily: 'प्रति रात कीमत (₹)',
    deposit: 'सिक्योरिटी डिपॉज़िट (₹)',
    maintenance: 'मासिक मेंटेनेंस (₹)',
    setupCost: 'सेटअप खर्च (₹)',
    otherCharges: 'अन्य शुल्क (₹)',
    otherChargesFor: 'अन्य शुल्क किसके लिए हैं',
    pgTitle: 'कमरे के बारे में',
    pgLead: 'बताएं कि कमरा किसके लिए ठीक है।',
    gender: 'किनके लिए',
    genderAny: 'कोई भी',
    male: 'पुरुष',
    female: 'महिलाएँ',
    sharing: 'कमरे का प्रकार',
    private_room: 'अलग कमरा',
    shared_room: 'साझा कमरा',
    master_bedroom: 'मास्टर बेडरूम',
    entire_flat: 'पूरा फ़्लैट',
    kitchen: 'रसोई के नियम',
    kitchenOptions: { vegetarian: 'शाकाहारी', non_vegetarian: 'मांसाहारी', eggetarian: 'अंडाहारी', any: 'कोई पाबंदी नहीं' },
    ventilation: 'हवा आना-जाना',
    ventilationOptions: { good: 'अच्छी', average: 'ठीक-ठाक', poor: 'कमज़ोर' },
    windows: 'खिड़कियाँ',
    maxPeople: 'ज़्यादा से ज़्यादा कितने लोग',
    notSet: '–',
    photos: 'फ़ोटो',
    photosHint: '20 फ़ोटो तक। पहली फ़ोटो कवर बनती है। JPEG, PNG या WebP।',
    addPhotos: 'फ़ोटो जोड़ें',
    uploading: 'अपलोड हो रहा है…',
    cover: 'कवर',
    makeCover: 'कवर बनाएँ',
    removePhoto: 'फ़ोटो हटाएँ',
    signInPhotos: 'फ़ोटो जोड़ने के लिए साइन इन करें। आप इन्हें बाद में भी जोड़ सकते हैं।',
    signIn: 'साइन इन',
    title: 'लिस्टिंग का शीर्षक',
    suggest: 'सुझाया गया शीर्षक लें',
    description: 'विवरण',
    descHint: 'यह घर रहने के लिए अच्छा क्यों है? रोशनी, नज़ारा, पड़ोस, आना-जाना।',
    ownerName: 'आपका नाम',
    ownerPhone: 'आपका मोबाइल नंबर',
    terms: ['यह प्रॉपर्टी मेरी है या मुझे इसे लिस्ट करने का अधिकार है। मैं ', 'सेवा की शर्तें', ' और ', 'प्राइवेसी पॉलिसी', ' मानता/मानती हूँ। 360Ghar की टीम लिस्टिंग के बारे में मुझे कॉल करेगी।'],
    back: 'पीछे',
    next: 'आगे बढ़ें',
    submit: 'मेरी प्रॉपर्टी पोस्ट करें',
    save: 'बदलाव सेव करें',
    submitting: 'पोस्ट हो रही है…',
    signInToPost: 'पोस्ट करने के लिए साइन इन करें',
    doneTitle: 'आपकी प्रॉपर्टी पोस्ट हो गई',
    doneBody: 'हमारी टीम विवरण देखकर 24 घंटे में आपको कॉल करेगी।',
    view: 'लिस्टिंग देखें',
    another: 'दूसरी प्रॉपर्टी पोस्ट करें',
    savedTitle: 'बदलाव सेव हो गए',
    inReview: 'यह पीजी या फ़्लैटमेट लिस्टिंग समीक्षा में है। हमारी टीम के मंज़ूर करने पर यह साइट पर फिर से दिखेगी।',
    loadError: 'यह लिस्टिंग बदलने के लिए लोड नहीं हो सकी।',
    retry: 'फिर कोशिश करें',
    notOwner: 'आप सिर्फ़ अपनी लिस्टिंग बदल सकते हैं।',
    draftRestored: 'आपका ड्राफ़्ट वापस आ गया।',
    clearDraft: 'फिर से शुरू करें',
    draftSaved: 'ड्राफ़्ट इसी डिवाइस पर सेव है',
    stepsLabel: 'चरण',
    goTo: (name: string) => `${name} पर वापस जाएँ`,
    stepLead: [
      'बताइए आप क्या लिस्ट कर रहे हैं।',
      'घर कहाँ है? लोकेलिटी डालें ताकि लोग उसे खोज सकें।',
      'कमरे, साइज़ और फ़्लोर। जो पता है वह भरें।',
      'आपकी माँगी गई कीमत, और किराये पर देने पर डिपॉज़िट।',
      'हर कमरे की साफ़ फ़ोटो। पहली फ़ोटो कवर बनती है।',
      'शीर्षक, घर के बारे में कुछ लाइनें, और हम आपसे कैसे संपर्क करें।',
    ],
    dropHint: 'या फ़ोटो यहाँ छोड़ें',
    dropNow: 'फ़ोटो जोड़ने के लिए यहाँ छोड़ें',
    moveEarlier: 'फ़ोटो पहले करें',
    moveLater: 'फ़ोटो बाद में करें',
    reorderHint: 'क्रम बदलने के लिए फ़ोटो खींचें, या तीर इस्तेमाल करें।',
    skipped: (n: number) => `${n} फ़ाइल छोड़ी गई। 50 MB तक की JPEG, PNG या WebP फ़ाइल इस्तेमाल करें।`,
    tooMany: 'आप 20 फ़ोटो तक जोड़ सकते हैं। बाकी फ़ाइलें नहीं जोड़ी गईं।',
    tooBig: 'ये फ़ोटो एक साथ अपलोड करने के लिए बहुत बड़ी हैं। आख़िरी फ़ोटो नहीं जोड़ी गईं। इन्हें इस बैच के बाद जोड़ें।',
    someFailed: (n: number) => `${n} फ़ोटो अपलोड नहीं हो सकीं।`,
    photoN: (i: number, n: number) => `फ़ोटो ${i} / ${n}`,
    previewTitle: 'यह ऐसा दिखेगा',
    previewLead: 'सर्च नतीजों में आपका कार्ड।',
    previewEmpty: 'अपना कार्ड देखने के लिए प्रॉपर्टी का प्रकार चुनें।',
    peek: 'अपना कार्ड देखें',
    pricePh: 'कीमत अभी नहीं डाली',
    tipsTitle: 'लिस्टिंग और बेहतर बनाएँ',
    tipPhotos: 'फ़ोटो जोड़ें',
    tipArea: 'एरिया डालें',
    tipAmenities: 'सुविधाएँ चुनें',
    tipDesc: 'छोटा विवरण लिखें',
    allSet: 'आपकी लिस्टिंग में मुख्य जानकारी है।',
    nextTitle: 'आगे क्या होगा',
    nextSteps: [
      ['हमारी टीम विवरण जाँचती है', 'हम 24 घंटे में आपको कॉल करते हैं।'],
      ['हम उसकी 360° फ़ोटो लेते हैं', 'फिर लिस्टिंग वेरिफाई करते हैं।'],
      ['आप अपने अकाउंट से संभालते हैं', 'मेरी लिस्टिंग में बदलें, फ़ोटो जोड़ें या हटाएँ।'],
    ],
    myListings: 'मेरी लिस्टिंग पर जाएँ',
  },
};

const EMPTY: Partial<FormIn> = { purpose: 'rent', city: 'Gurugram', amenity_ids: [], images: [] };

function fromProperty(p: Property): Partial<FormIn> {
  const s = (v: number | null | undefined) => (v === null || v === undefined ? undefined : String(v));
  const phone = (p.owner_contact ?? '').replace(/\D/g, '').slice(-10);
  return {
    purpose: p.purpose,
    property_type: p.property_type,
    full_address: p.full_address ?? '',
    locality: p.locality ?? '',
    city: p.city ?? 'Gurugram',
    pincode: p.pincode ?? '',
    landmark: p.landmark ?? '',
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    bedrooms: s(p.bedrooms),
    bathrooms: s(p.bathrooms),
    balconies: s(p.balconies),
    parking_spaces: s(p.parking_spaces),
    area_sqft: s(p.area_sqft),
    area_type: p.area_type ?? undefined,
    floor_number: s(p.floor_number),
    total_floors: s(p.total_floors),
    age_of_property: s(p.age_of_property),
    furnishing_level: p.furnishing_level ?? '',
    // A date (YYYY-MM-DD) from the API. The date input takes nothing else, so a longer value is cut.
    available_from: p.available_from?.slice(0, 10) ?? '',
    // The API returns gender and sharing inside listing_preferences.
    gender_preference: p.listing_preferences?.gender_preference ?? '',
    sharing_type: p.listing_preferences?.sharing_type ?? '',
    kitchen_type: p.kitchen_type ?? '',
    ventilation_type: p.ventilation_type ?? '',
    windows_count: s(p.windows_count),
    max_occupancy: s(p.max_occupancy),
    amenity_ids: (p.amenities ?? []).map((a) => a.id),
    sale_price: p.purpose === 'buy' ? s(p.base_price) : undefined,
    monthly_rent: s(p.monthly_rent),
    daily_rate: s(p.daily_rate),
    security_deposit: s(p.security_deposit),
    maintenance_charges: s(p.maintenance_charges),
    setup_cost: s(p.setup_cost),
    other_charges: s(p.other_charges),
    other_charges_description: p.other_charges_description ?? '',
    title: p.title,
    description: p.description ?? '',
    owner_name: p.owner_name ?? '',
    owner_phone: phone,
    images: [p.main_image_url, ...(p.images ?? []).map((i) => i.image_url)].filter((x, i, a): x is string => Boolean(x) && a.indexOf(x) === i),
  };
}

/** Photo types and size the upload endpoint takes (backend MAX_UPLOAD_SIZE_MB = 50). */
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_PHOTOS = 20;
/** Backend limit for one batch (BATCH_TOO_LARGE above it). */
const MAX_BATCH_BYTES = 200 * 1024 * 1024;

type Strings = (typeof T)['en'];

type PreviewProps = { v: Partial<FormIn>; t: Strings; locale: Locale; id: number; reach: number; step: number; hasAmenities: boolean; onJump: (i: number) => void };

/** The card as it will look, the title, and the tips. Used in the desktop aside and the phone strip. */
function PreviewBody({ v, t, locale, id, reach, step, hasAmenities, onJump }: PreviewProps) {
  const card = toCard(v, id);
  const tips: [string, number][] = [];
  if (!v.images?.length) tips.push([t.tipPhotos, 4]);
  if (!formNum(v.area_sqft)) tips.push([t.tipArea, 2]);
  if (hasAmenities && !v.amenity_ids?.length) tips.push([t.tipAmenities, 2]);
  if (!v.description?.trim()) tips.push([t.tipDesc, 5]);
  // Only nudge about steps the owner has already reached.
  const shown = tips.filter(([, i]) => i <= reach);
  return (
    <>
      {card ? (
        <div className="post-preview" inert>
          {/* No photo yet: the paper camera takes the photo's place, in the same 4:3 box. */}
          <PropertyCardView property={card.main_image_url ? card : { ...card, main_image_url: noPhotoUrl('post-preview') }} locale={locale} pricePlaceholder={t.pricePh} />
          {v.title?.trim() ? <p className="post-preview-title">{v.title}</p> : null}
        </div>
      ) : (
        <p className="post-preview-empty">
          <Icon name="home" size={20} />
          {t.previewEmpty}
        </p>
      )}
      {reach >= 2 ? (
        shown.length ? (
          <div className="grid gap-1">
            <p className="text-sm font-semibold">{t.tipsTitle}</p>
            <ul className="grid">
              {shown.map(([label, i]) => (
                <li key={label}>
                  {i === step ? (
                    <span className="post-tip">
                      <Icon name="plus" size={16} />
                      {label}
                    </span>
                  ) : (
                    <button type="button" className="post-tip post-tip-btn" onClick={() => onJump(i)}>
                      <Icon name="plus" size={16} />
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm font-semibold text-leaf-700">
            <Icon name="check" size={16} />
            {t.allSet}
          </p>
        )
      ) : null}
    </>
  );
}

/** Desktop: the preview beside the form, sticky. */
function Preview(props: PreviewProps) {
  const { t } = props;
  return (
    <aside className="post-aside" aria-labelledby="post-preview-h">
      <div>
        <h2 id="post-preview-h" className="post-aside-h">
          {t.previewTitle}
        </h2>
        <p className="text-sm text-ink-600">{t.previewLead}</p>
      </div>
      <PreviewBody {...props} />
    </aside>
  );
}

/**
 * Phones and tablets: a one-line strip above the form, closed by default. It
 * opens over the form (not in the flow), so nothing below it moves.
 */
function PreviewPeek(props: PreviewProps) {
  const { v, t, locale, onJump } = props;
  const ref = useRef<HTMLDetailsElement>(null);
  const card = toCard(v, props.id);
  const price = card && card.base_price > 0 ? listingPrice(card, locale) : null;
  const line = card
    ? [homeKind(card, locale), price ? `${price.amount}${price.period}` : t.pricePh].join(' · ')
    : t.previewEmpty;
  const close = () => {
    if (ref.current) ref.current.open = false;
  };
  return (
    <details ref={ref} className="post-peek">
      <summary className="post-peek-sum">
        <img src={v.images?.[0] ? v.images[0].replace('/upload/', '/upload/f_auto,q_auto,w_120/') : noPhotoUrl('post-preview')} alt="" width={48} height={36} className="post-peek-thumb" />
        <span className="grid min-w-0">
          <span className="font-semibold">{t.peek}</span>
          <span className="truncate text-sm text-ink-600">{line}</span>
        </span>
        <Icon name="chevron-down" size={20} className="post-peek-chev" />
      </summary>
      <div className="post-peek-body shadow-paper-lg">
        <PreviewBody
          {...props}
          onJump={(i) => {
            close();
            onJump(i);
          }}
        />
      </div>
    </details>
  );
}

/** Maps backend field names in a 422 to form fields. `base_price` is the field of the purpose: sale price, monthly rent or price per night. */
const fieldMap = (purpose: FormIn['purpose'] | undefined): Record<string, FieldPath<FormIn>> => ({
  base_price: purpose === 'rent' ? 'monthly_rent' : purpose === 'short_stay' ? 'daily_rate' : 'sale_price',
  owner_contact: 'owner_phone',
  image_urls: 'images',
  main_image_url: 'images',
});

function Wizard({ locale }: { locale: Locale }) {
  const t = T[locale];
  const amenities = useQuery({ queryKey: ['amenities'], queryFn: fetchAmenities, staleTime: 3600_000 }).data ?? [];
  const status = useAuth((s) => s.status);
  // The page is client only, so the URL and the draft can be read on the first render.
  const [init] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    const edit = Number(q.get('edit')) || null;
    // "Add photos" in My listings opens the photo step of the edit form.
    if (edit) return { edit, draft: null, start: q.get('step') === 'photos' ? 4 : 0 };
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT) ?? 'null') as { values: Partial<FormIn>; step: number } | null;
      return { edit, draft, start: draft?.step ?? 0 };
    } catch {
      return { edit, draft: null, start: 0 };
    }
  });
  const editId = init.edit;
  const last = STEPS.length - 1;
  const [step, setStep] = useState(() => Math.min(init.start, last));
  // The furthest step reached: earlier steps can be opened from the step bar.
  const [reach, setReach] = useState(() => (editId ? last : Math.min(init.start, last)));
  const [done, setDone] = useState<Property | null>(null);
  const [restored, setRestored] = useState(Boolean(init.draft));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [dropping, setDropping] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  // Photos that are a "Virtually staged" copy, with the original each one came from (kept for this tab's draft).
  const [staged, setStagedState] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STAGED) ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });
  // Functional, so two photos staged at once do not overwrite each other.
  const setStaged = (update: (prev: Record<string, string>) => Record<string, string>) =>
    setStagedState((prev) => {
      const next = update(prev);
      try {
        sessionStorage.setItem(STAGED, JSON.stringify(next));
      } catch {
        // Storage full: the original can no longer be put back after a reload.
      }
      return next;
    });
  const top = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);

  const form = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver((editId ? makeFormSchema(true) : formSchema) as typeof formSchema), defaultValues: { ...EMPTY, ...init.draft?.values }, mode: 'onTouched' });
  const v = useWatch({ control: form.control }) as Partial<FormIn>;
  const { errors, isDirty } = form.formState;

  const existing = useQuery({
    queryKey: ['property', editId],
    queryFn: () => call(api.GET('/api/v1/properties/{property_id}', { params: { path: { property_id: editId! } } })),
    enabled: Boolean(editId),
  });


  useEffect(() => {
    if (existing.data) form.reset({ ...EMPTY, ...fromProperty(existing.data) });
  }, [existing.data, form]);

  // Keep the draft (not in edit mode). Written on every change, so leaving
  // for the sign-in page right after the last keystroke loses nothing.
  // An untouched form is not a draft. The same rule shows "Draft saved".
  const drafting = !editId && !done && (isDirty || step > 0);
  useEffect(() => {
    if (!drafting) return;
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify({ values: { ...v, terms: undefined }, step }));
    } catch {
      // Storage full: the draft is not kept.
    }
  }, [v, step, drafting]);

  // PG and flatmate are rent only.
  useEffect(() => {
    if (v.property_type && RENT_ONLY.includes(v.property_type) && v.purpose !== 'rent') form.setValue('purpose', 'rent');
  }, [v.property_type, v.purpose, form]);

  const move = (to: number) => {
    setStep(to);
    setReach((r) => Math.max(r, to));
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Cross-field problems in one step, set on their fields. */
  const crossFail = (i: number) => {
    const g = form.getValues();
    const n = (x: unknown) => (x === '' || x === undefined || x === null ? undefined : Number(x));
    const issues = crossIssues({
      purpose: g.purpose,
      property_type: g.property_type,
      monthly_rent: n(g.monthly_rent),
      sale_price: n(g.sale_price),
      daily_rate: n(g.daily_rate),
      floor_number: n(g.floor_number),
      total_floors: n(g.total_floors),
    }).filter((x) => STEPS[i]!.includes(x.path));
    for (const x of issues) form.setError(x.path, { message: x.message });
    return issues.length > 0;
  };

  const go = async (to: number) => {
    if (to > step) {
      const fields = STEPS[step] as FieldPath<FormIn>[];
      const ok = await form.trigger(fields);
      if (!ok || crossFail(step)) {
        // Touched fields re-check on each change, so a fixed error clears while
        // typing, not on blur (a blur shift would move the button mid-click).
        for (const f of fields) form.setValue(f, form.getValues(f) as never, { shouldTouch: true });
        const bad = fields.find((f) => form.getFieldState(f).error);
        if (bad) form.setFocus(bad);
        return;
      }
    }
    move(to);
  };

  // A client-side error on submit: open the first step that has one.
  const onInvalid = (errs: Partial<Record<keyof FormIn, unknown>>) => {
    const i = STEPS.findIndex((s) => s.some((f) => errs[f]));
    if (i >= 0 && i !== step) move(i);
  };

  /** Opens a step from the step bar or a tip: back at once, forward after the current step checks out. */
  const jump = (to: number) => (to < step ? move(to) : void go(to));

  const images = v.images ?? [];
  const setImages = (next: string[]) => form.setValue('images', next, { shouldDirty: true });
  // Forget staged copies that are no longer photos of the listing, and all of them once it is posted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a derived clean-up of state that is also stored for reloads
    setStaged((prev) => {
      const keep = Object.fromEntries(Object.entries(prev).filter(([url]) => !done && (v.images ?? []).includes(url)));
      return Object.keys(keep).length === Object.keys(prev).length ? prev : keep;
    });
  }, [v.images, done]);
  const shift = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    setImages(next);
  };

  const upload = async (files: FileList | File[] | null) => {
    if (!files?.length || uploading) return;
    setUploadError(null);
    const all = [...files];
    const ok = all.filter((f) => OK_TYPES.includes(f.type) && f.size <= MAX_BYTES);
    const room = ok.slice(0, Math.max(0, MAX_PHOTOS - (form.getValues('images')?.length ?? 0)));
    // The backend refuses a batch over 200 MB (413 BATCH_TOO_LARGE) before it uploads any file.
    let bytes = 0;
    const list = room.filter((f) => (bytes + f.size <= MAX_BATCH_BYTES ? ((bytes += f.size), true) : false));
    const notes = [all.length > ok.length ? t.skipped(all.length - ok.length) : '', ok.length > room.length ? t.tooMany : '', room.length > list.length ? t.tooBig : ''].filter(Boolean);
    setUploadNote(notes.join(' ') || null);
    if (!list.length) return;
    // Local previews while the upload runs, so the owner sees what is coming.
    const previews = list.map((f) => URL.createObjectURL(f));
    setPending(previews);
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of list) fd.append('files', f);
      // `property_image` needs a property id, which this route does not take (422 FOLDER_TYPE_NOT_ALLOWED), so listing photos go to `generic`.
      fd.append('folder_type', 'generic');
      fd.append('visibility', 'public');
      const data = await call(api.POST('/api/v1/upload/batch', { ...multipart(fd), ...timeoutMs(UPLOAD_TIMEOUT_MS) }));
      // One item per file. A file that fails shows no URL; the others are kept.
      const urls = data.items.flatMap((i) => (i.status === 'uploaded' && i.result ? [i.result.public_url] : []));
      form.setValue('images', [...(form.getValues('images') ?? []), ...urls].slice(0, MAX_PHOTOS), { shouldDirty: true });
      const failed = data.items.length - urls.length;
      if (failed > 0) setUploadNote([notes.join(' '), t.someFailed(failed)].filter(Boolean).join(' '));
    } catch (e) {
      setUploadError(describeError(e, locale).body);
    } finally {
      setUploading(false);
      setPending([]);
      for (const u of previews) URL.revokeObjectURL(u);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    if (dragFrom === null && e.dataTransfer.files.length) void upload(e.dataTransfer.files);
  };

  const submit = async (values: FormOut) => {
    // The status can still be "unknown" while the auth SDK loads: settle it first.
    await initAuth();
    if (useAuthStore.getState().status !== 'authed') {
      window.location.assign(loginHref(locale));
      return;
    }
    try {
      const saved = editId
        ? await call(api.PUT('/api/v1/properties/{property_id}', { params: { path: { property_id: editId } }, body: toUpdatePayload(values) }))
        : await call(api.POST('/api/v1/properties', { body: toPayload(values) }));
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {
        // Nothing to clean.
      }
      setDone(saved);
      // The success sheet replaces the form: bring its top into view.
      requestAnimationFrame(() => shell.current?.scrollIntoView({ block: 'start' }));
    } catch (e) {
      // A 422 names its fields (details.fields): show each under its field and open the first step that has one.
      if (e instanceof ApiError && Object.keys(e.fields).length) {
        const steps = applyFieldErrors(e, form, { map: fieldMap(values.purpose), any: true })
          .map((n) => STEPS.findIndex((s) => s.includes(n as keyof FormIn)))
          .filter((i) => i >= 0);
        if (steps.length) {
          move(Math.min(...steps));
          return;
        }
      }
      if (e instanceof ApiError && e.kind === 'forbidden') return form.setError('root', { message: t.notOwner });
      // No field matched, or the error has no fields (a 409, a 429, a 503): say what happened.
      form.setError('root', { message: describeError(e, locale).body });
    }
  };

  // The sheet is cut like the shared Paper component (same seed as the page fallback).
  const sheet = (children: ReactNode) => (
    <div ref={shell} className="soft-lift post-sheet" data-depth="2">
      <div className="grain post-inner" style={{ backgroundColor: 'var(--color-paper)' }}>
        {children}
      </div>
    </div>
  );

  if (existing.error)
    return sheet(
      <StateBlock
        scene="error"
        title={t.loadError}
        body={describeError(existing.error, locale).body}
        action={{ label: t.retry, onClick: () => void existing.refetch() }}
        compact
      />,
    );

  if (editId && !existing.data)
    return sheet(
      <div className="grid gap-4" aria-busy="true">
        <span className="skeleton h-6 w-48" />
        <span className="skeleton h-2 w-full" />
        <span className="skeleton mt-4 h-11 w-full" />
        <span className="skeleton h-24 w-full" />
      </div>,
    );

  if (done)
    return sheet(
      <div className="post-done" role="status">
        <div className="post-done-art">
          <Vignette name="posted" />
        </div>
        <div className="grid content-start justify-items-start gap-4">
          <h2 className="font-display text-3xl">{editId ? t.savedTitle : t.doneTitle}</h2>
          {/* A new or edited PG or flatmate listing waits for review (listing_preferences.moderation_status). */}
          {done.listing_preferences?.moderation_status === 'pending_review' ? <p className="text-ink-800">{t.inReview}</p> : null}
          {!editId ? (
            <div className="grid gap-3">
              <p className="font-semibold">{t.nextTitle}</p>
              <ol className="post-next">
                {t.nextSteps.map(([head, body], k) => (
                  <li key={head}>
                    <Icon name={(['phone', 'camera', 'home'] as const)[k]!} size={22} />
                    <p>
                      <span className="font-semibold text-ink-950">{head}.</span> {body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a className="btn btn-primary" href={localizePath(`/property/${done.id}`, locale)}>
              {t.view}
              <Icon name="arrow-up-right" size={18} className="arrow" />
            </a>
            <a className="link" href={localizePath('/account?tab=listings', locale)}>
              {t.myListings}
            </a>
            {!editId ? (
              <button
                type="button"
                className="link cursor-pointer border-0 bg-transparent p-0"
                onClick={() => {
                  form.reset(EMPTY);
                  setStep(0);
                  setReach(0);
                  setDone(null);
                }}
              >
                {t.another}
              </button>
            ) : null}
          </div>
        </div>
      </div>,
    );

  const rooms = !(v.property_type && NO_ROOMS.includes(v.property_type));
  const pgLike = Boolean(v.property_type && RENT_ONLY.includes(v.property_type));
  const amenityBox = (a: Amenity) => (
    <Check
      key={a.id}
      label={a.title}
      checked={(v.amenity_ids ?? []).includes(a.id)}
      onChange={(e) =>
        form.setValue('amenity_ids', e.target.checked ? [...(v.amenity_ids ?? []), a.id] : (v.amenity_ids ?? []).filter((x) => x !== a.id), { shouldDirty: true })
      }
    />
  );
  const n = STEPS.length;

  return (
    <div className="post-layout">
      <PreviewPeek v={v} t={t} locale={locale} id={editId ?? 0} reach={reach} step={step} hasAmenities={amenities.length > 0} onJump={jump} />
      {sheet(
        <form className="post" onSubmit={(e) => void form.handleSubmit(submit, onInvalid)(e)} noValidate>
          <div ref={top} className="post-progress">
            <HouseProgress placed={step} className="post-house" />
            <div className="grid min-w-0 content-center gap-1">
              <p className="font-semibold" aria-live="polite">
                {t.stepOf(step + 1, n, t.steps[step]!)}
              </p>
              <p className="text-sm text-ink-600">{t.stepLead[step]}</p>
            </div>
            <ol className="post-bar" aria-label={t.stepsLabel}>
              {t.steps.map((name, i) => {
                const inner = (
                  <>
                    <span className="post-seg" aria-hidden="true" />
                    <span className="post-seg-l">{name}</span>
                  </>
                );
                return (
                  <li key={name} data-on={i <= step || undefined}>
                    {i !== step && i <= reach ? (
                      <button type="button" className="post-seg-btn" aria-label={i < step ? t.goTo(name) : name} onClick={() => jump(i)}>
                        {inner}
                      </button>
                    ) : (
                      <span className="post-seg-btn" aria-current={i === step ? 'step' : undefined}>
                        {inner}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            {restored ? (
              <p className="post-restored text-sm text-ink-600">
                {t.draftRestored}{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    form.reset(EMPTY);
                    setStep(0);
                    setReach(0);
                    setRestored(false);
                    try {
                      sessionStorage.removeItem(DRAFT);
                    } catch {
                      // Nothing to clean.
                    }
                  }}
                >
                  {t.clearDraft}
                </button>
              </p>
            ) : null}
          </div>

          {step === 0 ? (
            <fieldset className="post-step">
              <legend className="visually-hidden">{t.steps[0]}</legend>
              <div className="field">
                <span className="field-label">{t.purpose}</span>
                <div>
                  <Segmented
                    label={t.purpose}
                    value={v.purpose}
                    onChange={(val) => form.setValue('purpose', val, { shouldValidate: true, shouldDirty: true })}
                    disabled={(val) => Boolean(v.property_type && RENT_ONLY.includes(v.property_type) && val !== 'rent')}
                    options={[
                      ['buy', t.sell],
                      ['rent', t.rentOut],
                      ['short_stay', t.short],
                    ]}
                  />
                </div>
                {errors.purpose ? <p className="field-error">{errors.purpose.message}</p> : null}
              </div>
              <div className="field">
                <span className="field-label">{t.type}</span>
                <Segmented
                  radio
                  className="filter-row"
                  label={t.type}
                  value={v.property_type}
                  options={TYPES.map((pt) => [pt, typeLabel(pt, locale)] as const)}
                  onChange={(pt) => form.setValue('property_type', pt, { shouldValidate: true, shouldDirty: true })}
                />
                {errors.property_type ? <p className="field-error">{errors.property_type.message}</p> : null}
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset className="post-step">
              <legend className="visually-hidden">{t.steps[1]}</legend>
              <div className="field">
                <span className="field-label">{t.search}</span>
                <PlacesInput
                  name="place"
                  label={t.search}
                  placeholder={t.locality}
                  defaultValue={v.locality ?? ''}
                  onPlace={(p) => {
                    if (!p) return;
                    form.setValue('latitude', p.lat);
                    form.setValue('longitude', p.lng);
                    if (!v.locality) form.setValue('locality', p.name);
                  }}
                />
              </div>
              <TextAreaField label={t.address} hint={t.addressHint} rows={2} error={errors.full_address?.message} {...form.register('full_address')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label={t.locality} error={errors.locality?.message} {...form.register('locality')} />
                <TextField label={t.city} error={errors.city?.message} {...form.register('city')} />
                <TextField label={t.pincode} optional={t.optional} inputMode="numeric" maxLength={6} error={errors.pincode?.message} {...form.register('pincode')} />
                <TextField label={t.landmark} optional={t.optional} error={errors.landmark?.message} {...form.register('landmark')} />
              </div>
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset className="post-step">
              <legend className="visually-hidden">{t.steps[2]}</legend>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {rooms ? <TextField label={t.bedrooms} type="number" min={0} inputMode="numeric" error={errors.bedrooms?.message} {...form.register('bedrooms')} /> : null}
                <TextField label={t.bathrooms} type="number" min={0} inputMode="numeric" error={errors.bathrooms?.message} {...form.register('bathrooms')} />
                {rooms ? <TextField label={t.balconies} type="number" min={0} inputMode="numeric" error={errors.balconies?.message} {...form.register('balconies')} /> : null}
                <TextField label={t.parking} type="number" min={0} inputMode="numeric" error={errors.parking_spaces?.message} {...form.register('parking_spaces')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label={t.area} inputMode="numeric" error={errors.area_sqft?.message} {...form.register('area_sqft')} />
                <SelectField label={t.areaType} {...form.register('area_type')}>
                  <option value="">–</option>
                  {t.areaTypes.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </SelectField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <TextField label={t.floor} type="number" min={0} inputMode="numeric" error={errors.floor_number?.message} {...form.register('floor_number')} />
                <TextField label={t.floors} type="number" min={0} inputMode="numeric" {...form.register('total_floors')} />
                <TextField label={t.age} type="number" min={0} inputMode="numeric" error={errors.age_of_property?.message} {...form.register('age_of_property')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label={t.furnishing} {...form.register('furnishing_level')}>
                  <option value="">–</option>
                  <option value="furnished">{t.furnished}</option>
                  <option value="semi_furnished">{t.semi}</option>
                  <option value="unfurnished">{t.unfurnished}</option>
                </SelectField>
                <TextField label={t.availableFrom} type="date" error={errors.available_from?.message} {...form.register('available_from')} />
              </div>
              {pgLike ? (
                <fieldset className="field">
                  <legend className="field-label">{t.pgTitle}</legend>
                  <p className="field-hint">{t.pgLead}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label={t.gender} {...form.register('gender_preference')}>
                      <option value="">{t.notSet}</option>
                      <option value="any">{t.genderAny}</option>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                    </SelectField>
                    <SelectField label={t.sharing} {...form.register('sharing_type')}>
                      <option value="">{t.notSet}</option>
                      {SHARING_TYPES.map((x) => (
                        <option key={x} value={x}>
                          {t[x]}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField label={t.kitchen} {...form.register('kitchen_type')}>
                      <option value="">{t.notSet}</option>
                      {KITCHEN_TYPES.map((x) => (
                        <option key={x} value={x}>
                          {t.kitchenOptions[x]}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField label={t.ventilation} {...form.register('ventilation_type')}>
                      <option value="">{t.notSet}</option>
                      {VENTILATION_TYPES.map((x) => (
                        <option key={x} value={x}>
                          {t.ventilationOptions[x]}
                        </option>
                      ))}
                    </SelectField>
                    <TextField label={t.windows} type="number" min={0} inputMode="numeric" error={errors.windows_count?.message} {...form.register('windows_count')} />
                    <TextField label={t.maxPeople} type="number" min={0} inputMode="numeric" error={errors.max_occupancy?.message} {...form.register('max_occupancy')} />
                  </div>
                </fieldset>
              ) : null}
              {amenities.length ? (
                <fieldset className="field">
                  <legend className="field-label">{t.amenities}</legend>
                  <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">{amenities.slice(0, 12).map(amenityBox)}</div>
                  {amenities.length > 12 ? (
                    <details className="post-more">
                      <summary className="btn btn-quiet -ml-3">
                        {t.moreAmenities(amenities.length - 12, amenities.slice(12).filter((a) => (v.amenity_ids ?? []).includes(a.id)).length)}
                      </summary>
                      <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">{amenities.slice(12).map(amenityBox)}</div>
                    </details>
                  ) : null}
                </fieldset>
              ) : null}
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset className="post-step">
              <legend className="visually-hidden">{t.steps[3]}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {v.purpose === 'buy' ? <TextField label={t.salePrice} inputMode="numeric" error={errors.sale_price?.message} {...form.register('sale_price')} /> : null}
                {v.purpose === 'rent' ? <TextField label={t.rent} inputMode="numeric" error={errors.monthly_rent?.message} {...form.register('monthly_rent')} /> : null}
                {v.purpose === 'short_stay' ? <TextField label={t.daily} inputMode="numeric" error={errors.daily_rate?.message} {...form.register('daily_rate')} /> : null}
                {v.purpose !== 'buy' ? <TextField label={t.deposit} optional={t.optional} inputMode="numeric" {...form.register('security_deposit')} /> : null}
                <TextField label={t.maintenance} optional={t.optional} inputMode="numeric" error={errors.maintenance_charges?.message} {...form.register('maintenance_charges')} />
                {v.purpose !== 'buy' ? <TextField label={t.setupCost} optional={t.optional} inputMode="numeric" error={errors.setup_cost?.message} {...form.register('setup_cost')} /> : null}
                {v.purpose !== 'buy' ? <TextField label={t.otherCharges} optional={t.optional} inputMode="numeric" error={errors.other_charges?.message} {...form.register('other_charges')} /> : null}
                {v.purpose !== 'buy' ? <TextField label={t.otherChargesFor} optional={t.optional} maxLength={300} error={errors.other_charges_description?.message} {...form.register('other_charges_description')} /> : null}
              </div>
            </fieldset>
          ) : null}

          {step === 4 ? (
            <fieldset className="post-step" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
              <legend className="field-label">{t.photos}</legend>
              <p className="field-hint">{t.photosHint}</p>
              {status === 'anon' ? (
                <p className="contact-note">
                  {t.signInPhotos}{' '}
                  <a className="link" href={loginHref(locale)}>
                    {t.signIn}
                  </a>
                </p>
              ) : (
                <div
                  className="post-drop"
                  data-over={dropping || undefined}
                  onDragEnter={(e) => {
                    if (dragFrom === null && e.dataTransfer.types.includes('Files')) setDropping(true);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropping(false);
                  }}
                >
                  <label className="btn">
                    <Icon name="upload" size={18} />
                    {uploading ? t.uploading : t.addPhotos}
                    <input type="file" accept={OK_TYPES.join(',')} multiple className="visually-hidden" disabled={uploading || images.length >= MAX_PHOTOS} onChange={(e) => void upload(e.target.files).then(() => (e.target.value = ''))} />
                  </label>
                  <span className="post-drop-hint">{dropping ? t.dropNow : t.dropHint}</span>
                </div>
              )}
              {uploadError ? (
                <p className="field-error" role="alert">
                  <Icon name="alert" size={16} />
                  {uploadError}
                </p>
              ) : null}
              {uploadNote ? (
                <p className="field-hint" role="status">
                  {uploadNote}
                </p>
              ) : null}
              {images.length || pending.length ? (
                <ul className="post-photos">
                  {images.map((url, i) => (
                    <li
                      key={url}
                      draggable
                      data-dragging={dragFrom === i || undefined}
                      onDragStart={(e) => {
                        setDragFrom(i);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => setDragFrom(null)}
                      onDragOver={(e) => {
                        if (dragFrom !== null) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (dragFrom === null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        shift(dragFrom, i);
                        setDragFrom(null);
                      }}
                    >
                      <img src={url.replace('/upload/', '/upload/f_auto,q_auto,w_320/')} alt={t.photoN(i + 1, images.length)} width={160} height={120} loading="lazy" draggable={false} />
                      <div className="post-photo-bar">
                        {i === 0 ? (
                          <span className="post-cover">
                            <Icon name="check" size={16} />
                            {t.cover}
                          </span>
                        ) : (
                          <button type="button" className="btn btn-quiet post-make-cover" onClick={() => shift(i, 0)}>
                            {t.makeCover}
                          </button>
                        )}
                      </div>
                      <div className="post-photo-tools">
                        {i > 0 ? (
                          <button type="button" className="btn btn-quiet btn-icon" aria-label={`${t.moveEarlier}: ${t.photoN(i + 1, images.length)}`} onClick={() => shift(i, i - 1)}>
                            <Icon name="chevron-left" size={18} />
                          </button>
                        ) : (
                          <span className="post-tool-gap" />
                        )}
                        {i < images.length - 1 ? (
                          <button type="button" className="btn btn-quiet btn-icon" aria-label={`${t.moveLater}: ${t.photoN(i + 1, images.length)}`} onClick={() => shift(i, i + 1)}>
                            <Icon name="chevron-right" size={18} />
                          </button>
                        ) : (
                          <span className="post-tool-gap" />
                        )}
                        <button type="button" className="btn btn-quiet btn-icon" aria-label={`${t.removePhoto}: ${t.photoN(i + 1, images.length)}`} onClick={() => setImages(images.filter((x) => x !== url))}>
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                      {AI_OWNER_TOOLS && status === 'authed' ? (
                        <StageControl locale={locale} url={url} staged={staged} setStaged={setStaged} replace={(from, to) => setImages((form.getValues('images') ?? []).map((x) => (x === from ? to : x)))} />
                      ) : null}
                    </li>
                  ))}
                  {pending.map((url) => (
                    <li key={url} className="post-pending" aria-hidden="true">
                      <img src={url} alt="" width={160} height={120} />
                      <p className="text-sm font-semibold text-ink-600">{t.uploading}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {images.length > 1 ? <p className="field-hint">{t.reorderHint}</p> : null}
              {AI_OWNER_TOOLS && status === 'authed' && images.length > 0 ? <p className="field-hint">{stageNote(locale)}</p> : null}
            </fieldset>
          ) : null}

          {step === 5 ? (
            <fieldset className="post-step">
              <legend className="visually-hidden">{t.steps[5]}</legend>
              {AI_OWNER_TOOLS && status === 'authed' ? (
                <ListingWriter
                  locale={locale}
                  images={images}
                  details={listingDetails(v as Record<string, unknown>)}
                  onUse={(text) => {
                    form.setValue('title', text.title, { shouldValidate: true, shouldDirty: true });
                    form.setValue('description', text.description, { shouldValidate: true, shouldDirty: true });
                  }}
                />
              ) : null}
              <div className="grid gap-2">
                <TextField label={t.title} maxLength={200} error={errors.title?.message} {...form.register('title')} />
                <button
                  type="button"
                  className="btn btn-quiet justify-self-start -ml-3"
                  onClick={() => form.setValue('title', suggestTitle(v, v.property_type ? typeLabel(v.property_type, 'en') : 'Property'), { shouldValidate: true })}
                >
                  {t.suggest}
                </button>
              </div>
              <TextAreaField label={t.description} optional={t.optional} hint={t.descHint} rows={4} maxLength={5000} {...form.register('description')} />
              {editId ? (
                <p className="field-hint">{t.ownerFixed}</p>
              ) : (
                <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label={t.ownerName} autoComplete="name" error={errors.owner_name?.message} {...form.register('owner_name')} />
                  <TextField label={t.ownerPhone} inputMode="numeric" autoComplete="tel-national" maxLength={10} error={errors.owner_phone?.message} {...form.register('owner_phone')} />
                </div>
                <div>
                  <Check
                    label={
                      <>
                        {t.terms[0]}
                        <a className="post-inline-link" href={localizePath('/policies/terms-of-service', locale)} target="_blank" rel="noopener">
                          {t.terms[1]}
                        </a>
                        {t.terms[2]}
                        <a className="post-inline-link" href={localizePath('/policies/privacy-policy', locale)} target="_blank" rel="noopener">
                          {t.terms[3]}
                        </a>
                        {t.terms[4]}
                      </>
                    }
                    className="post-terms"
                    {...form.register('terms')}
                  />
                  {errors.terms ? <p className="field-error">{errors.terms.message}</p> : null}
                </div>
                </>
              )}
            </fieldset>
          ) : null}

          {errors.root ? (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} />
              {errors.root.message}
            </p>
          ) : null}

          <div className="post-nav">
            {step > 0 ? (
              <button type="button" className="btn btn-quiet" onClick={() => void go(step - 1)}>
                <Icon name="arrow-left" size={18} />
                {t.back}
              </button>
            ) : (
              <span />
            )}
            {/* Separate keys: if React reused this node, it would turn into type="submit"
                during the click on the last "Continue" and submit the form at once. */}
            {step < n - 1 ? (
              <button key="next" type="button" className="btn btn-primary" onClick={() => void go(step + 1)}>
                {t.next}
                <Icon name="arrow-right" size={18} />
              </button>
            ) : (
              <button key="submit" type="submit" className="btn btn-primary" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t.submitting : status === 'anon' ? t.signInToPost : editId ? t.save : t.submit}
              </button>
            )}
          </div>
          {/* The line's height is kept from the start, so it appears without moving anything. */}
          {!editId ? (
            <p className="post-draft" role="status">
              {drafting ? (
                <>
                  <Icon name="check" size={14} />
                  {t.draftSaved}
                </>
              ) : null}
            </p>
          ) : null}
        </form>,
      )}
      <Preview v={v} t={t} locale={locale} id={editId ?? 0} reach={reach} step={step} hasAmenities={amenities.length > 0} onJump={jump} />
    </div>
  );
}

export default function PostProperty({ locale = 'en' }: { locale?: Locale }) {
  return (
    <QueryProvider>
      <IslandBoundary locale={locale}>
        <Wizard locale={locale} />
      </IslandBoundary>
    </QueryProvider>
  );
}
