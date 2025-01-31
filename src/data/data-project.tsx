// const projectCardData = [
//   {
//     title: 'Portfolio Website',
//     date: '2024-01-10',
//     description:
//       'A personal portfolio website to showcase projects and skills.',
//     stack: ['Next.js', 'TailwindCSS', 'Vercel'],
//     isBrowser: true,
//     isGithub: true,
//     browserLink: 'https://myportfolio.com',
//     githubLink: 'https://github.com/example/portfolio',
//     projectType: 'Personal',
//     projectRole: 'Frontend',
//   },
//   {
//     title: 'DevOps Automation Script',
//     date: '2023-11-30',
//     description: 'A script to automate server deployment and monitoring.',
//     stack: ['Python', 'Docker', 'Kubernetes', 'Terraform'],
//     isGithub: true,
//     githubLink: 'https://github.com/example/devops-script',
//     companyName: 'CloudOps Ltd.',
//     projectType: 'Freelance',
//     projectRole: 'DevOps',
//   },
//   {
//     title: 'E-Commerce Website',
//     date: '2023-08-15',
//     description: 'A fully responsive e-commerce website for a clothing brand.',
//     stack: ['React', 'Node.js', 'Express', 'MongoDB'],
//     isBrowser: true,
//     isGithub: true,
//     browserLink: 'https://ecommerce-example.com',
//     githubLink: 'https://github.com/example/ecommerce',
//     companyName: 'Tech Solutions Inc.',
//     projectType: 'Company',
//     projectRole: 'Fullstack',
//   },
//   {
//     title: 'Mobile Banking App',
//     date: '2023-05-22',
//     description:
//       'A secure mobile banking application for a financial institution.',
//     stack: ['Flutter', 'Firebase', 'Dart'],
//     isMobile: true,
//     mobileLink: 'https://playstore.com/banking-app',
//     companyName: 'FinanceCorp',
//     projectType: 'Company',
//     projectRole: 'UI/UX',
//   },
// ].sort((a, b) => new Date(b.date) - new Date(a.date));

// const filterProjects = (searchQuery, projectType, projectRole) => {
//   return projectCardData.filter((project) => {
//     const matchesSearch = searchQuery
//       ? project.title.toLowerCase().includes(searchQuery.toLowerCase())
//       : true;
//     const matchesType = projectType
//       ? project.projectType === projectType
//       : true;
//     const matchesRole = projectRole
//       ? project.projectRole === projectRole
//       : true;
//     return matchesSearch && matchesType && matchesRole;
//   });
// };

// const paginateProjects = (projects:, page, pageSize) => {
//   const startIndex = (page - 1) * pageSize;
//   return projects.slice(startIndex, startIndex + pageSize);
// };

// export { projectCardData, filterProjects, paginateProjects };
