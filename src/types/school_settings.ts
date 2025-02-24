export type Grade = {
    id: string;
    name: string;
    colombianGrade: number;
    sectionId: string;
    section: Section;
    createdAt: Date;
    updatedAt: Date;
    // You *could* include groups and gradeOfferings here if needed, but it's best
    // to keep the type relatively shallow for the table. Fetch those on demand
    // if you need to display them in a detail view.
  };

  export type Section = {
    id: string;
    name: string;
};