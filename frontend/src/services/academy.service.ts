import { MOCK_ACADEMY, MOCK_COURSES, MOCK_SUBJECTS, MOCK_BATCHES } from '@/lib/mockData';
import { Course, Subject, Batch } from '@/types/course';

export const academyService = {
  getAcademyDetails: async () => {
    return Promise.resolve(MOCK_ACADEMY);
  },
  getCourses: async (): Promise<Course[]> => {
    return Promise.resolve(MOCK_COURSES);
  },
  getSubjects: async (): Promise<Subject[]> => {
    return Promise.resolve(MOCK_SUBJECTS);
  },
  getBatches: async (): Promise<Batch[]> => {
    return Promise.resolve(MOCK_BATCHES);
  },
};
