// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  try {
    // --- Sections ---
    const sectionsData: Prisma.SectionCreateInput[] = [
      { name: 'Mi Taller', order: 1 },
      { name: 'Preescolar', order: 2 },
      { name: 'Primaria', order: 3 },
      { name: 'Middle School', order: 4 },
      { name: 'High School', order: 5 },
    ];

    for (const sectionData of sectionsData) {
      const existingSection = await prisma.section.findUnique({
        where: { name: sectionData.name },
      });
      if (existingSection) {
        console.warn(`Section "${sectionData.name}" already exists. Skipping.`);
      } else {
        const section = await prisma.section.create({ data: sectionData });
        console.log(`Created section with id: ${section.id}`);
      }
    }

    // --- Grades, Groups and Trimesters ---
    const gradesData: {
      name: string;
      colombianGrade: number | null;
      sectionName: string;
      groups: string[];
      trimesters:number[];
    }[] = [
        { name: 'Kinder 1', colombianGrade: null, sectionName: 'Mi Taller', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Kinder 2', colombianGrade: null, sectionName: 'Mi Taller', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Kinder 3', colombianGrade: null, sectionName: 'Mi Taller', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Kinder 4', colombianGrade: null, sectionName: 'Preescolar', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Kinder 5', colombianGrade: null, sectionName: 'Preescolar', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Primero', colombianGrade: null, sectionName: 'Preescolar', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Segundo', colombianGrade: 1, sectionName: 'Primaria', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Tercero', colombianGrade: 2, sectionName: 'Primaria', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Cuarto', colombianGrade: 3, sectionName: 'Primaria', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Quinto', colombianGrade: 4, sectionName: 'Primaria', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Sexto', colombianGrade: 5, sectionName: 'Middle School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Septimo', colombianGrade: 6, sectionName: 'Middle School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Octavo', colombianGrade: 7, sectionName: 'Middle School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Noveno', colombianGrade: 8, sectionName: 'Middle School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Decimo', colombianGrade: 9, sectionName: 'High School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Once', colombianGrade: 10, sectionName: 'High School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
        { name: 'Doce', colombianGrade: 11, sectionName: 'High School', groups: ['A', 'B'],trimesters: [1, 2, 3] },
      ];

      for (const gradeData of gradesData) {
        const section = await prisma.section.findUnique({
          where: { name: gradeData.sectionName },
        });
        if (!section) {
          console.error(`Section "${gradeData.sectionName}" not found. Skipping grade "${gradeData.name}".`);
          continue; // Skip to the next grade
        }
    
        const existingGrade = await prisma.grade.findFirst({
            where: {
                name: gradeData.name,
                sectionId: section.id,
            }
        });

        let gradeId: string;

        if(existingGrade) {
            console.warn(`Grade "${gradeData.name}" in section "${gradeData.sectionName}" already exists. Skipping creation.`);
            gradeId = existingGrade.id;  // Use existing grade's ID
        } else {
            const grade = await prisma.grade.create({
                data: {
                  name: gradeData.name,
                  colombianGrade: gradeData.colombianGrade,
                  section: { connect: { id: section.id } },
                },
              });
              console.log(`Created grade with id: ${grade.id}`);
              gradeId = grade.id;
        }


      for (const groupName of gradeData.groups) {
        const existingGroup = await prisma.group.findFirst({
            where: {
                name: groupName,
                gradeId: gradeId
            }
        });

        if(existingGroup){
            console.warn(`Group "${groupName}" for grade "${gradeData.name}" already exists. Skipping.`);
        }else{
            const group = await prisma.group.create({
              data: {
                name: groupName,
                grade: { connect: { id: gradeId } },
              },
            });
            console.log(`Created group with id: ${group.id}`);
        }
      }
    }

    console.log(`Seeding finished.`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();