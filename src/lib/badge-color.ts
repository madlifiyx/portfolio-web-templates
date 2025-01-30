export const roleColors = (role?: string) => {
  switch (role) {
    case 'Frontend':
      return 'bg-red-500 hover:bg-red-600';
    case 'Backend':
      return 'bg-green-500 hover:bg-green-600';
    case 'Fullstack':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'UI/UX':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'Database':
      return 'bg-indigo-500 hover:bg-indigo-600';
    case 'DevOps':
      return 'bg-pink-500 hover:bg-pink-600';
    case 'Security':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'Project Manager':
      return 'bg-violet-500 hover:bg-violet-600';
    case 'System Analyst':
      return 'bg-cyan-500 hover:bg-cyan-600';
    case 'Quality Assurance':
      return 'bg-teal-500 hover:bg-teal-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

export const typeProjectColors = (type?: string) => {
  switch (type) {
    case 'Personal':
      return 'bg-red-400 hover:bg-red-400/80';
    case 'Freelance':
      return 'bg-blue-400 hover:bg-blue-400/80';
    case 'Company':
      return 'bg-green-400 hover:bg-green-400/80';
    default:
      return 'bg-gray-400 hover:bg-gray-400/80';
  }
};
