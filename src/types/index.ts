export interface Subject {
  id: string;
  name: string;
  vision?: string;
  mission?: string;
  generalObjective?: string;
  specificObjectives?: string[];
  didactics?: string;
  crossCuttingProjects: Project[]; // Add this line
  gradeOfferings: GradeOffering[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeOffering {
  id: string;
  subjectId: string;
  grade: string;
  groupName?: string;
  finalReport: string;
  trimesters: Trimester[];
}

export interface Trimester {
  id: string;
  gradeOfferingId: string;
  number: 1 | 2 | 3;
  benchmarks: Benchmark[];
}

export interface Benchmark {
  id: string;
  trimesterId: string;
  benchmark: string;
  learningEvidence: {
    communication?: string;
    sensitivity?: string;
    aestheticAppreciation?: string;
  };
  thematicsComponents: string[];
}
export interface Grade { 
  id: string;
  name: string;
  colombianGrade: number | null;
  sectionId: string;
}
export interface Group { 
  id: string;
  name: string | null;
  gradeId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  subjects?: Subject[]; // Add this to show the relation
  createdAt: Date;
  updatedAt: Date;
}