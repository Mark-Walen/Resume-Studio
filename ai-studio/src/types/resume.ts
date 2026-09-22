export type ResumeTemplateId = 'modern' | 'classic' | 'tech-sidebar' | 'creative' | 'compact';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  avatarUrl?: string;
  expectedSalary?: string;
  gender?: string;
  birthDate?: string;
  workStartDate?: string;
  ethnicity?: string;
  politicalStatus?: string;
  highestEducation?: string;
  targetCities?: string;
  salaryMin?: string;
  salaryMax?: string;
  availability?: string;
}

export type BuiltInResumeSection = 'jobIntent' | 'summary' | 'skills' | 'workExperience' | 'projects' | 'education' | 'certificates';

export interface CustomResumeSection {
  id: string;
  title: string;
  content: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  department?: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
  technologies?: string[];
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
  techStack: string[];
  link?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  id: string;
  title: string;
  lastModified: string;
  personalInfo: PersonalInfo;
  summary: string;
  skills: SkillCategory[];
  workExperience: WorkExperience[];
  projects: ProjectExperience[];
  education: Education[];
  certificates: Certificate[];
  customSections?: CustomResumeSection[];
  sectionOrder?: string[];
}

export interface ResumeTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'compact' | 'normal' | 'spacious';
}
