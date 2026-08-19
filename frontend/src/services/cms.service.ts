import { MOCK_TESTIMONIALS, MOCK_ENQUIRIES } from '@/lib/mockData';

export const cmsService = {
  getTestimonials: async () => {
    return Promise.resolve(MOCK_TESTIMONIALS);
  },
  getEnquiries: async () => {
    return Promise.resolve(MOCK_ENQUIRIES);
  },
  createContactEnquiry: async (enquiry: { name: string; email: string; phone: string; subject: string; message: string }) => {
    return Promise.resolve({ success: true, data: enquiry });
  },
};
