import { ResumeData } from '../types/resume';

// New accounts start with an empty private resume. Existing local/cloud data is
// loaded independently and is never replaced by this template.
export const DEFAULT_RESUME: ResumeData = {
  id: 'resume-empty',
  title: '未命名简历',
  lastModified: new Date().toISOString(),
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
  },
  jobIntent: {
    desiredPosition: '',
    desiredSalary: '',
    desiredCity: '',
    jobStatus: '',
    workType: '',
  },
  summary: '',
  skills: [],
  workExperience: [],
  projects: [],
  education: [],
  certificates: [],
  customSections: [],
};

export const defaultResume = DEFAULT_RESUME;
