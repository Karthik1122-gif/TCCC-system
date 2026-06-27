// Import comprehensive traffic signals from separate file
import { HYDERABAD_SIGNALS } from './hyderabadSignals.js';

export { HYDERABAD_SIGNALS };

// Mock Hyderabad Hospitals with GPS coordinates (Expanded List - 28 hospitals)
export const HYDERABAD_HOSPITALS = [
  // Major Multi-Specialty Hospitals
  { id: 'h1', name: 'Apollo Hospital', area: 'Jubilee Hills', lat: 17.4218, lng: 78.4071, type: 'Multi-Specialty', beds: 450, phone: '040-23607777', rating: 4.8 },
  { id: 'h2', name: 'Yashoda Hospital', area: 'Somajiguda', lat: 17.4267, lng: 78.4563, type: 'Multi-Specialty', beds: 320, phone: '040-45674567', rating: 4.7 },
  { id: 'h3', name: 'Care Hospital', area: 'Banjara Hills', lat: 17.4100, lng: 78.4483, type: 'Cardiac Center', beds: 200, phone: '040-30418000', rating: 4.6 },
  { id: 'h4', name: 'NIMS', area: 'Punjagutta', lat: 17.4319, lng: 78.4500, type: 'Government', beds: 800, phone: '040-23320001', rating: 4.5 },
  { id: 'h5', name: 'Kamineni Hospital', area: 'LB Nagar', lat: 17.3421, lng: 78.5472, type: 'Multi-Specialty', beds: 300, phone: '040-66666666', rating: 4.4 },
  { id: 'h6', name: 'Omni Hospital', area: 'Gachibowli', lat: 17.4400, lng: 78.3489, type: 'Trauma Center', beds: 250, phone: '040-44343434', rating: 4.5 },
  { id: 'h7', name: 'MaxCure Hospital', area: 'Madhapur', lat: 17.4511, lng: 78.3822, type: 'Neuro Specialty', beds: 180, phone: '040-44552211', rating: 4.3 },
  { id: 'h8', name: 'Sunshine Hospital', area: 'Secunderabad', lat: 17.4436, lng: 78.4993, type: 'Gynecology', beds: 220, phone: '040-40454545', rating: 4.2 },
  
  // Additional Major Hospitals
  { id: 'h9', name: 'Continental Hospitals', area: 'Gachibowli', lat: 17.4425, lng: 78.3442, type: 'Multi-Specialty', beds: 750, phone: '040-67676767', rating: 4.7 },
  { id: 'h10', name: 'Rainbow Children Hospital', area: 'Banjara Hills', lat: 17.4156, lng: 78.4410, type: 'Pediatric', beds: 200, phone: '040-35002222', rating: 4.8 },
  { id: 'h11', name: 'Asian Institute of Gastroenterology', area: 'Gachibowli', lat: 17.4389, lng: 78.3752, type: 'Gastro Specialty', beds: 150, phone: '040-23378888', rating: 4.6 },
  { id: 'h12', name: 'Star Hospital', area: 'Banjara Hills', lat: 17.4185, lng: 78.4426, type: 'Multi-Specialty', beds: 300, phone: '040-44777000', rating: 4.5 },
  { id: 'h13', name: 'Gandhi Hospital', area: 'Musheerabad', lat: 17.4431, lng: 78.4818, type: 'Government', beds: 1000, phone: '040-27560131', rating: 4.2 },
  { id: 'h14', name: 'Aware Gleneagles Global Hospital', area: 'LB Nagar', lat: 17.3456, lng: 78.5521, type: 'Multi-Specialty', beds: 450, phone: '040-67064444', rating: 4.6 },
  { id: 'h15', name: 'KIMS Hospital', area: 'Kondapur', lat: 17.4650, lng: 78.3648, type: 'Multi-Specialty', beds: 300, phone: '040-44885000', rating: 4.5 },
  
  // Newer Additions
  { id: 'h16', name: 'Apollo Cradle', area: 'Jubilee Hills', lat: 17.4299, lng: 78.4085, type: 'Maternity', beds: 100, phone: '040-23558888', rating: 4.4 },
  { id: 'h17', name: 'Medicover Hospital', area: 'Madhapur', lat: 17.4488, lng: 78.3899, type: 'Multi-Specialty', beds: 200, phone: '040-68334455', rating: 4.3 },
  { id: 'h18', name: 'Citizens Hospital', area: 'Nallagandla', lat: 17.4755, lng: 78.3593, type: 'Multi-Specialty', beds: 150, phone: '040-67166666', rating: 4.2 },
  { id: 'h19', name: 'Fernandez Hospital', area: 'Hyderguda', lat: 17.3972, lng: 78.4684, type: 'Maternity', beds: 120, phone: '040-24759999', rating: 4.7 },
  { id: 'h20', name: 'Apollo Spectra', area: 'Kondapur', lat: 17.4611, lng: 78.3711, type: 'Surgery Center', beds: 80, phone: '040-49670000', rating: 4.4 },
  
  // Eastern & Southern Areas
  { id: 'h21', name: 'Prasad Hospital', area: 'Nacharam', lat: 17.4342, lng: 78.5469, type: 'Multi-Specialty', beds: 150, phone: '040-27177777', rating: 4.1 },
  { id: 'h22', name: 'Global Hospital', area: 'Lakdi Ka Pul', lat: 17.3997, lng: 78.4536, type: 'Liver Specialty', beds: 200, phone: '040-23607777', rating: 4.6 },
  { id: 'h23', name: 'Virinchi Hospital', area: 'Banjara Hills', lat: 17.4143, lng: 78.4373, type: 'Multi-Specialty', beds: 250, phone: '040-23559999', rating: 4.5 },
  { id: 'h24', name: 'AIG Hospital', area: 'Gachibowli', lat: 17.4483, lng: 78.3514, type: 'Multi-Specialty', beds: 300, phone: '040-42224444', rating: 4.7 },
  { id: 'h25', name: 'PACE Hospital', area: 'HITECH City', lat: 17.4509, lng: 78.3819, type: 'Cardiac', beds: 180, phone: '040-44885000', rating: 4.4 },
  
  // Additional Nearby Hospitals
  { id: 'h26', name: 'Apollo Hospital', area: 'Hyderguda', lat: 17.3981, lng: 78.4712, type: 'Multi-Specialty', beds: 300, phone: '040-66775555', rating: 4.6 },
  { id: 'h27', name: 'Care Hospital', area: 'HITECH City', lat: 17.4502, lng: 78.3735, type: 'Multi-Specialty', beds: 220, phone: '040-61651000', rating: 4.5 },
  { id: 'h28', name: 'Osmania General Hospital', area: 'Afzal Gunj', lat: 17.3732, lng: 78.4873, type: 'Government', beds: 1200, phone: '040-24600146', rating: 4.1 },

  // Additional Hospitals for denser nearby coverage
  { id: 'h29', name: 'Aster Prime Hospital', area: 'Ameerpet', lat: 17.4379, lng: 78.4486, type: 'Multi-Specialty', beds: 260, phone: '040-49594959', rating: 4.4 },
  { id: 'h30', name: 'KIMS Sunshine Hospital', area: 'Begumpet', lat: 17.4448, lng: 78.4692, type: 'Multi-Specialty', beds: 300, phone: '040-44112233', rating: 4.3 },
  { id: 'h31', name: 'Image Hospital', area: 'Madhapur', lat: 17.4456, lng: 78.3924, type: 'Multi-Specialty', beds: 180, phone: '040-40204020', rating: 4.2 },
  { id: 'h32', name: 'Sri Sri Holistic Hospitals', area: 'Nanakramguda', lat: 17.4148, lng: 78.3369, type: 'Multi-Specialty', beds: 220, phone: '040-68168888', rating: 4.3 },
  { id: 'h33', name: 'Usha Mullapudi Cardiac Centre', area: 'Gajularamaram', lat: 17.5184, lng: 78.4378, type: 'Cardiac Center', beds: 150, phone: '040-23055666', rating: 4.2 },
  { id: 'h34', name: 'Basavatarakam Indo American Cancer Hospital', area: 'Banjara Hills', lat: 17.4149, lng: 78.4263, type: 'Cancer Center', beds: 300, phone: '040-23551235', rating: 4.6 },
  { id: 'h35', name: 'Princess Durru Shehvar Hospital', area: 'Purani Haveli', lat: 17.3718, lng: 78.4862, type: 'Maternity', beds: 140, phone: '040-24524500', rating: 4.0 },
  { id: 'h36', name: 'Niloufer Hospital', area: 'Nampally', lat: 17.3989, lng: 78.4678, type: 'Pediatric', beds: 320, phone: '040-23314095', rating: 4.2 },
  { id: 'h37', name: 'Owaisi Hospital', area: 'Kanchanbagh', lat: 17.3411, lng: 78.4984, type: 'Multi-Specialty', beds: 500, phone: '040-24342222', rating: 4.1 },
  { id: 'h38', name: 'Thumbay Hospital', area: 'New Malakpet', lat: 17.3749, lng: 78.5032, type: 'Multi-Specialty', beds: 220, phone: '040-61356666', rating: 4.0 },
  { id: 'h39', name: 'Apollo DRDO Hospital', area: 'Kanchanbagh', lat: 17.3263, lng: 78.5068, type: 'Multi-Specialty', beds: 160, phone: '040-44445555', rating: 4.1 },
  { id: 'h40', name: 'SLG Hospitals', area: 'Bachupally', lat: 17.5472, lng: 78.3913, type: 'Trauma Center', beds: 350, phone: '040-44556677', rating: 4.3 },
  { id: 'h41', name: 'Malla Reddy Narayana Multispeciality Hospital', area: 'Kompally', lat: 17.5456, lng: 78.4847, type: 'Multi-Specialty', beds: 280, phone: '040-33993399', rating: 4.1 },
  { id: 'h42', name: 'KIMS Hospital', area: 'Secunderabad', lat: 17.4395, lng: 78.4924, type: 'Multi-Specialty', beds: 400, phone: '040-44887766', rating: 4.4 },
  { id: 'h43', name: 'Yashoda Hospital', area: 'Hitec City', lat: 17.4476, lng: 78.3786, type: 'Multi-Specialty', beds: 350, phone: '040-49004900', rating: 4.6 },
  { id: 'h44', name: 'Aarogyasri Health Care Trust Hospital', area: 'Barkatpura', lat: 17.3938, lng: 78.5001, type: 'Government', beds: 210, phone: '040-23456789', rating: 3.9 },
  { id: 'h45', name: 'Srikara Hospitals', area: 'Miyapur', lat: 17.4942, lng: 78.3619, type: 'Orthopedic', beds: 190, phone: '040-47474747', rating: 4.2 },
  { id: 'h46', name: 'Pulse Hospital', area: 'Padmarao Nagar', lat: 17.4354, lng: 78.5035, type: 'Multi-Specialty', beds: 130, phone: '040-42004200', rating: 4.0 },
  { id: 'h47', name: 'Renova Neelima Hospital', area: 'Sanath Nagar', lat: 17.4582, lng: 78.4469, type: 'Multi-Specialty', beds: 170, phone: '040-40123456', rating: 4.1 },
  { id: 'h48', name: 'Vasavi Hospital', area: 'Lakdikapul', lat: 17.4062, lng: 78.4577, type: 'Multi-Specialty', beds: 160, phone: '040-23232729', rating: 4.0 },
];
