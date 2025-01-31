import { company1, education1 } from '@/assets/images';

export interface ExperienceDataProps {
  link?: string;
  logoImage?: string;
  place?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export const workExperience: ExperienceDataProps[] = [
  {
    link: 'https://company1.com',
    logoImage: company1,
    place: 'Company One',
    position: 'Software Engineer',
    startDate: 'Jan 2020',
    endDate: 'Dec 2022',
    description:
      'Developed scalable web applications and improved system performance.',
  },
  {
    link: 'https://company2.com',
    logoImage: '/assets/images/company/company2.png',
    place: 'Company Two',
    position: 'Frontend Developer',
    startDate: 'Mar 2018',
    endDate: 'Nov 2019',
    description:
      'Designed user interfaces and enhanced user experience on multiple projects.',
  },
  {
    link: 'https://company3.com',
    logoImage: '/assets/images/company/company3.png',
    place: 'Company Three',
    position: 'Backend Developer',
    startDate: 'May 2017',
    endDate: 'Feb 2018',
    description:
      'Developed RESTful APIs and optimized database queries for efficiency.',
  },
  {
    link: 'https://company4.com',
    logoImage: '/assets/images/company/company4.png',
    place: 'Company Four',
    position: 'Full Stack Developer',
    startDate: 'Aug 2016',
    endDate: 'Apr 2017',
    description:
      'Built and maintained web applications using modern frameworks.',
  },
  {
    link: 'https://company5.com',
    logoImage: '/assets/images/company/company5.png',
    place: 'Company Five',
    position: 'DevOps Engineer',
    startDate: 'Jun 2015',
    endDate: 'Jul 2016',
    description: 'Managed CI/CD pipelines and optimized cloud infrastructure.',
  },
  {
    link: 'https://company6.com',
    logoImage: '/assets/images/company/company6.png',
    place: 'Company Six',
    position: 'Mobile Developer',
    startDate: 'Sep 2014',
    endDate: 'May 2015',
    description: 'Developed mobile applications for Android and iOS platforms.',
  },
  {
    link: 'https://company7.com',
    logoImage: '/assets/images/company/company7.png',
    place: 'Company Seven',
    position: 'Data Analyst',
    startDate: 'Jan 2013',
    endDate: 'Aug 2014',
    description:
      'Analyzed business data and created predictive models to support decision-making.',
  },
  {
    link: 'https://company8.com',
    logoImage: '/assets/images/company/company8.png',
    place: 'Company Eight',
    position: 'Cybersecurity Analyst',
    startDate: 'Oct 2012',
    endDate: 'Dec 2013',
    description:
      'Implemented security protocols and monitored systems for vulnerabilities.',
  },
  {
    link: 'https://company9.com',
    logoImage: '/assets/images/company/company9.png',
    place: 'Company Nine',
    position: 'Project Manager',
    startDate: 'Feb 2011',
    endDate: 'Sep 2012',
    description:
      'Led development teams and managed software project lifecycles.',
  },
  {
    link: 'https://company10.com',
    logoImage: '/assets/images/company/company10.png',
    place: 'Company Ten',
    position: 'UI/UX Designer',
    startDate: 'Jul 2010',
    endDate: 'Jan 2011',
    description:
      'Created wireframes and prototypes to enhance user engagement.',
  },
];

export const educationExperience: ExperienceDataProps[] = [
  {
    link: 'https://www.neuversity.id/',
    logoImage: education1,
    place: 'Neuversity',
    position: 'Full Stack Developer',
    startDate: 'Jun 2022',
    endDate: 'Dec 2022',
    description:
      'Developed web applications and implemented RESTful APIs for clients.',
  },
  {
    link: 'https://www.mit.edu',
    logoImage: '/assets/images/mit.png',
    place: 'Massachusetts Institute of Technology',
    position: 'Master of Artificial Intelligence',
    startDate: 'Sep 2019',
    endDate: 'Jun 2021',
    description: 'Focused on deep learning and machine learning research.',
  },
  {
    link: 'https://www.stanford.edu',
    logoImage: '/assets/images/stanford.png',
    place: 'Stanford University',
    position: 'PhD in Computer Science',
    startDate: 'Sep 2021',
    endDate: 'Present',
    description:
      'Researching advanced computer vision and natural language processing.',
  },
  {
    link: 'https://www.ox.ac.uk',
    logoImage: '/assets/images/oxford.png',
    place: 'University of Oxford',
    position: 'Diploma in Data Science',
    startDate: 'Jan 2018',
    endDate: 'Dec 2018',
    description: 'Completed a one-year intensive course in big data analytics.',
  },
  {
    link: 'https://www.cam.ac.uk',
    logoImage: '/assets/images/cambridge.png',
    place: 'University of Cambridge',
    position: 'Bachelor of Information Technology',
    startDate: 'Sep 2013',
    endDate: 'Jun 2017',
    description:
      'Studied software development, cybersecurity, and network systems.',
  },
  {
    link: 'https://www.tsinghua.edu.cn',
    logoImage: '/assets/images/tsinghua.png',
    place: 'Tsinghua University',
    position: 'Master of Cybersecurity',
    startDate: 'Sep 2016',
    endDate: 'Jun 2018',
    description:
      'Focused on ethical hacking and security protocol development.',
  },
  {
    link: 'https://www.ethz.ch',
    logoImage: '/assets/images/ethzurich.png',
    place: 'ETH Zurich',
    position: 'PhD in Quantum Computing',
    startDate: 'Sep 2020',
    endDate: 'Present',
    description: 'Conducting research in quantum algorithms and cryptography.',
  },
  {
    link: 'https://www.nus.edu.sg',
    logoImage: '/assets/images/nus.png',
    place: 'National University of Singapore',
    position: 'Bachelor of Software Engineering',
    startDate: 'Aug 2014',
    endDate: 'May 2018',
    description:
      'Built software projects and worked on full-stack development.',
  },
  {
    link: 'https://www.tokyotech.ac.jp',
    logoImage: '/assets/images/tokyotech.png',
    place: 'Tokyo Institute of Technology',
    position: 'Master of Robotics',
    startDate: 'Apr 2017',
    endDate: 'Mar 2019',
    description: 'Studied automation, AI-driven robotics, and mechatronics.',
  },
  {
    link: 'https://www.berkeley.edu',
    logoImage: '/assets/images/berkeley.png',
    place: 'University of California, Berkeley',
    position: 'Certificate in Blockchain Development',
    startDate: 'Jun 2021',
    endDate: 'Dec 2021',
    description:
      'Completed a professional certification in blockchain technology and decentralized applications.',
  },
];
