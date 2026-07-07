-- Refresh vehicle image arrays with more specific media from the existing Petroni site.
-- This removes the most obvious repeated placeholders while leaving records without
-- credible matching source photos for a later client/photo pass.

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2.jpg',
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-17.jpg',
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-16.jpg'
]
where slug = 'weinsberg-caraone-550qdk';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550UK-4.jpg',
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550UK-14.jpg',
  'https://www.petroni.hr/wp-content/uploads/2025/05/CO550UK-15.jpg'
]
where slug = 'weinsberg-caraone-550uk';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/03/Horon-79M-1.png',
  'https://www.petroni.hr/wp-content/uploads/2025/02/Horon79.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/03/Horon79.0.jpg'
]
where slug in ('family-air-plus-ci-horon-79m', 'caravans-international-horon-79m');

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2025/02/1-caratour.webp',
  'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour.webp',
  'https://www.petroni.hr/wp-content/uploads/2025/02/4-caratour.webp'
]
where slug in ('caratour-ford-600mq', 'caratour-ford-600mq-prodaja');

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/03/Boxdrive0.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/03/Boxdrive1.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/03/Boxdrive2.jpg'
]
where slug = 'fun-cxl-air-knaus-boxdrive-680me';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/06/image1-1-1.jpeg',
  'https://www.petroni.hr/wp-content/uploads/2024/06/Petroni-NEWBudgetvan.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/06/Petroni-NOVOBudgetvan.jpg'
]
where slug = 'budgetvan-55';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/03/T4.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/03/T4.1.jpg',
  'https://www.petroni.hr/wp-content/uploads/2024/03/T4.2.jpg'
]
where slug = 'v4wd-petrovan-53-4motion';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/03/rollerteam.jpg'
]
where slug = 'family-air-plus-roller-team-kronos-277m';

update vehicles
set images = array[
  'https://www.petroni.hr/wp-content/uploads/2024/03/Surf-1_Rimor-24.jpg',
  'https://www.petroni.hr/wp-content/uploads/2022/12/layout-Kilig_50.jpg'
]
where slug = 'family-air-rimor-kilig-50';
