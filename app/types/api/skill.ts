export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  canDelete: boolean;
}

export interface CreateSkillRequest {
  name: string;
  description?: string | null;
}
