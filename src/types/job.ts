export type ApplicationStatus = 
  | 'wishlist'     // 预投递 (Target / To Apply)
  | 'applied'      // 已投递 (Applied)
  | 'screening'    // 简历筛选通过 (Screening passed)
  | 'interviewing' // 面试中 (Interviewing)
  | 'offer'        // 已拿 Offer (Offer received)
  | 'rejected'     // 未通过/归档 (Archived / Rejected);

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  salaryExpectation?: string;
  location?: string;
  status: ApplicationStatus;
  priority: 'high' | 'medium' | 'low';
  source?: string; // e.g. Boss直聘, 猎聘, 员工内推, 官网投递
  recruiterContact?: string;
  jobDescription?: string;
  appliedDate?: string;
  wishlistTargetDate?: string;
  notes?: string;
  updatedAt: string;
}
