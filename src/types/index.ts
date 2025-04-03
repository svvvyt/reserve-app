export interface Company {
  id: number;
  name: string;
  photo: string;
  headline: string;
  ya_grade: string;
  email: string;
  link_inst: string;
  link_vk: string;
  link_tg: string;
  link_whatsapp: string;
  link_fb: string;
  link_youtube: string;
  is_active: boolean;
}

export interface Branch {
  id: number;
  company: number;
  name: string;
  photo: string;
  address: string;
  landmark: string;
  phone_number_main: string;
  phone_number_admin: string;
  id_tg_bot_group: number;
  is_main: boolean;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
}

export interface Employee {
  id: number;
  full_name: string;
  photo: string;
  grade: string;
  is_active: boolean;
  branch: number;
  services: number[];
}

export interface ServiceCategory {
  id: number;
  company: number;
  name: string;
  photo: string;
  is_active: boolean;
}

export interface BarberService {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  branch: number;
  category: number;
  duration?: string;
  description?: string;
}

export interface AppointmentRequest {
  specialist: number;
  services: number[];
  date: string;
  time: string;
  full_name: string;
  phone: string;
  user_tg?: string;
}

// YMapsWidget
export interface BranchMapObject {
  mainLink: string;
  mainLinkText: string;
  categoryLink: string;
  categoryLinkText: string;
  iframeSrc: string;
  width?: string;
  height?: string;
}
