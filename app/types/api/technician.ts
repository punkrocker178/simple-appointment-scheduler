export interface TechnicianSkillSummary {
  id: string;
  name: string;
}

export interface Technician {
  id: string;
  dealershipId: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  skills: TechnicianSkillSummary[];
}

export interface CreateTechnicianRequest {
  firstName: string;
  lastName: string;
  skillIds?: string[] | null;
}

export interface UpdateTechnicianRequest {
  firstName: string;
  lastName: string;
  skillIds?: string[] | null;
}
