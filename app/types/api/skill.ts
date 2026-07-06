export interface Skill {
  id: string;
  name: string;
  description?: string | null;
}

export interface CreateSkillRequest {
  name: string;
  description?: string | null;
}
