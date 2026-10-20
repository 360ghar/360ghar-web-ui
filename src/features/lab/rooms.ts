import type { PhotoGroup } from '@/features/property/photos';

export const ROOM_NAMES: Record<'en' | 'hi', Record<PhotoGroup, string>> = {
  en: { entrance: 'Entrance', hall: 'Living room', room: 'Bedroom', kitchen: 'Kitchen', balcony: 'Balcony', bathroom: 'Bathroom', terrace: 'Terrace', exterior: 'Outside', others: 'More' },
  hi: { entrance: 'प्रवेश', hall: 'लिविंग रूम', room: 'बेडरूम', kitchen: 'रसोई', balcony: 'बालकनी', bathroom: 'बाथरूम', terrace: 'छत', exterior: 'बाहर', others: 'और' },
};
