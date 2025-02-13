export interface Subject {
  id: string;
  name: string;
  vision?: string;
  mission?: string;
  generalObjective?: string;
  specificObjectives?: string[];
  didactics?: string;
  crossCuttingProjects?: string;
  gradeOfferings: GradeOffering[];
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