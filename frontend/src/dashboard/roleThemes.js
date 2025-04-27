import psikolog from './images/psikolog.jpg';
import nutricionist from './images/nutricionist.jpg';
import trajner from './images/trajner.jpg';
import fizioterapeut from './images/fizioterapeut.jpg';
const roleThemes = {
    // Psychologist Theme - Muted Teal/Beige
    psikolog: {
        // Lavender base with warm coral complements
        
        primaryColor: '#9A86A2',  // Dusty lavender
        secondaryColor: '#C7B8D2',  // Light lavender
        lightColor: '#F9F7FB',  // Off-white
        darkColor: '#6A5D7A',  // Deep lavender
     
        bannerClass: 'bg-gradient-to-r from-purple-200 to-amber-200',
     
        buttonClass: 'bg-purple-500 hover:bg-purple-600',
    
        textClass: 'text-purple-900',
        
        backgroundPattern: 'url("/patterns/soft-waves.svg")',
    
        backgroundImage: 'linear-gradient(rgba(154, 134, 162, 0.04), rgba(224, 169, 143, 0.02))',
        
        icon: '🧠',
        images: [psikolog],
      
        themeName: 'mindful-vitality'
    },
    // Trainer Theme - Charcoal with Teal Accents
    trajner: {
      primaryColor: '#2F4F4F',  // Dark slate with teal undertone
      secondaryColor: '#5F9EA0',  // Cadet blue
      lightColor: '#F0F5F5',    // Light teal-tinged grey
      darkColor: '#1E3D3D',
      backgroundImage: 'linear-gradient(rgba(47, 79, 79, 0.1), rgba(47, 79, 79, 0.1))',
      icon: '💪',
      images: [
         trajner
       
      ],
      bannerClass: 'bg-gradient-to-r from-gray-800 to-teal-800',
      buttonClass: 'bg-gray-800 hover:bg-gray-900',
      textClass: 'text-gray-800',
      backgroundPattern: 'url("/patterns/fitness-pattern.svg")',
      themeName: 'fitness'
    },
    
    // Nutritionist Theme - Earthy Green-Teal
    nutricionist: {
      primaryColor: '#5F9A8B',  // Soft green-teal
      secondaryColor: '#8FB3A5',
      lightColor: '#F0F5F3',    // Light green-teal
      darkColor: '#3D6B5F',
      backgroundImage: 'linear-gradient(rgba(95, 154, 139, 0.1), rgba(95, 154, 139, 0.1))',
      icon: '🥗',
      images: [
        nutricionist
     
      ],
      bannerClass: 'bg-gradient-to-r from-teal-600 to-green-600',
      buttonClass: 'bg-teal-600 hover:bg-teal-700',
      textClass: 'text-teal-800',
      backgroundPattern: 'url("/patterns/food-pattern.svg")',
      themeName: 'nutrition'
    },
    
    // Physiotherapist Theme - Cool Teal
    fizioterapeut: {
      primaryColor: '#4B9EAA',  // Medium teal
      secondaryColor: '#7DBDC8',
      lightColor: '#F0F7F8',    // Pale teal
      darkColor: '#2E7D8A',
      backgroundImage: 'linear-gradient(rgba(75, 158, 170, 0.1), rgba(75, 158, 170, 0.1))',
      icon: '🩹',
      images: [
        fizioterapeut
      ],
      bannerClass: 'bg-gradient-to-r from-cyan-600 to-teal-600',
      buttonClass: 'bg-cyan-600 hover:bg-cyan-700',
      textClass: 'text-cyan-800',
      backgroundPattern: 'url("/patterns/massage-pattern.svg")',
      themeName: 'physiotherapy'
    },
    
    // Default Client Theme - Warm Teal
    client: {
      primaryColor: '#5E8B7E',  // Matching psychologist theme
      secondaryColor: '#A7C4BC',
      lightColor: '#F0F5F4',    // Very light teal
      darkColor: '#3D5A50',
      backgroundImage: 'linear-gradient(rgba(94, 139, 126, 0.1), rgba(94, 139, 126, 0.1))',
      icon: '👤',
      images: [],
      bannerClass: 'bg-gradient-to-r from-teal-600 to-teal-500',
      buttonClass: 'bg-teal-600 hover:bg-teal-700',
      textClass: 'text-teal-800',
      backgroundPattern: '',
      themeName: 'default'
    }
};
  
  // Priority order for themes when multiple roles are present
  const themePriority = [
    'psikolog',
    'trajner',
    'nutricionist',
    'fizioterapeut',
    'client'
  ];
  
  // Function to determine the theme based on roles present


  
  
  // Helper function to normalize role keys
  const getRoleKey = (roleId, roles = []) => {
    const role = roles.find(r => r._id === roleId || r.mysqlId === roleId?.toString());
    if (!role) return 'client';
    
    const roleNameMap = {
      'Client': 'client',
      'Fizioterapeut': 'fizioterapeut',
      'Nutricionist': 'nutricionist',
      'Trajner': 'trajner',
      'Psikolog': 'psikolog'
    };
    
    return roleNameMap[role.name] || 'client';
  };
  
  export const getProgramTheme = (members = [], roles = []) => {
    if (!members.length) return roleThemes.client;
    
    const rolesPresent = [...new Set(members.map(m => getRoleKey(m.role, roles)))];
    
    for (const role of themePriority) {
      if (rolesPresent.includes(role)) {
        return roleThemes[role];
      }
    }
    
    return roleThemes.client;
  };


  export default roleThemes;