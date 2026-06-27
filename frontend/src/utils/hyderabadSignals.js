// Comprehensive Hyderabad Traffic Signal Junctions (All major real intersections across the city)
// Coordinates are accurate map positions based on Google Maps data
const RAW_HYDERABAD_SIGNALS = [
  // Central Hyderabad & Punjagutta Area
  { id: 's1', junctionName: 'Panjagutta Junction', location: { lat: 17.4319, lng: 78.4494 }, currentState: 'red', redTime: 62, yellowTime: 4, greenTime: 86, cycleTime: 152 },
  { id: 's2', junctionName: 'Ameerpet Metro Junction', location: { lat: 17.4374, lng: 78.4482 }, currentState: 'green', redTime: 58, yellowTime: 4, greenTime: 78, cycleTime: 140 },
  { id: 's3', junctionName: 'S.R. Nagar Junction', location: { lat: 17.4446, lng: 78.4405 }, currentState: 'yellow', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  { id: 's4', junctionName: 'Erragadda Junction', location: { lat: 17.4514, lng: 78.4298 }, currentState: 'red', redTime: 58, yellowTime: 4, greenTime: 76, cycleTime: 138 },
  
  // Begumpet & Paradise Area
  { id: 's5', junctionName: 'Begumpet Greenlands Signal', location: { lat: 17.4438, lng: 78.4625 }, currentState: 'green', redTime: 48, yellowTime: 5, greenTime: 72, cycleTime: 125 },
  { id: 's6', junctionName: 'Paradise Circle', location: { lat: 17.4419, lng: 78.4862 }, currentState: 'red', redTime: 60, yellowTime: 4, greenTime: 82, cycleTime: 146 },
  { id: 's7', junctionName: 'Rasoolpura Junction', location: { lat: 17.4457, lng: 78.4731 }, currentState: 'yellow', redTime: 52, yellowTime: 4, greenTime: 68, cycleTime: 124 },
  
  // Secunderabad Area
  { id: 's8', junctionName: 'Secunderabad Clock Tower', location: { lat: 17.4399, lng: 78.4983 }, currentState: 'green', redTime: 54, yellowTime: 4, greenTime: 70, cycleTime: 128 },
  { id: 's9', junctionName: 'Patny Centre Junction', location: { lat: 17.4311, lng: 78.5027 }, currentState: 'red', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  { id: 's10', junctionName: 'Gandhi Bhavan Signal', location: { lat: 17.4251, lng: 78.5064 }, currentState: 'green', redTime: 48, yellowTime: 3, greenTime: 66, cycleTime: 117 },
  { id: 's11', junctionName: 'Tivoli Junction', location: { lat: 17.4335, lng: 78.5156 }, currentState: 'yellow', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  
  // Old City & Nampally Area
  { id: 's12', junctionName: 'Nampally Junction', location: { lat: 17.3897, lng: 78.4765 }, currentState: 'red', redTime: 66, yellowTime: 5, greenTime: 84, cycleTime: 155 },
  { id: 's13', junctionName: 'Abids GPO Junction', location: { lat: 17.3927, lng: 78.4767 }, currentState: 'green', redTime: 50, yellowTime: 5, greenTime: 68, cycleTime: 123 },
  { id: 's14', junctionName: 'Koti Women College Junction', location: { lat: 17.3868, lng: 78.4868 }, currentState: 'yellow', redTime: 52, yellowTime: 4, greenTime: 74, cycleTime: 130 },
  { id: 's15', junctionName: 'Sultan Bazaar Junction', location: { lat: 17.3818, lng: 78.4763 }, currentState: 'red', redTime: 58, yellowTime: 4, greenTime: 76, cycleTime: 138 },
  { id: 's16', junctionName: 'Charminar Junction', location: { lat: 17.3616, lng: 78.4747 }, currentState: 'green', redTime: 64, yellowTime: 5, greenTime: 86, cycleTime: 155 },
  
  // Banjara Hills & Jubilee Hills Area
  { id: 's17', junctionName: 'Lakdi Ka Pul Junction', location: { lat: 17.4016, lng: 78.4562 }, currentState: 'red', redTime: 57, yellowTime: 4, greenTime: 79, cycleTime: 140 },
  { id: 's18', junctionName: 'Masab Tank Junction', location: { lat: 17.4029, lng: 78.4521 }, currentState: 'yellow', redTime: 55, yellowTime: 4, greenTime: 75, cycleTime: 134 },
  { id: 's19', junctionName: 'Banjara Hills Road No. 1', location: { lat: 17.4183, lng: 78.4456 }, currentState: 'green', redTime: 46, yellowTime: 3, greenTime: 64, cycleTime: 113 },
  { id: 's20', junctionName: 'Banjara Hills Road No. 12', location: { lat: 17.4095, lng: 78.4390 }, currentState: 'red', redTime: 48, yellowTime: 4, greenTime: 66, cycleTime: 118 },
  { id: 's21', junctionName: 'Jubilee Hills Check Post', location: { lat: 17.4281, lng: 78.4124 }, currentState: 'green', redTime: 47, yellowTime: 3, greenTime: 73, cycleTime: 123 },
  { id: 's22', junctionName: 'Film Nagar Junction', location: { lat: 17.4231, lng: 78.3989 }, currentState: 'yellow', redTime: 49, yellowTime: 4, greenTime: 71, cycleTime: 124 },
  
  // Mehdipatnam & Tolichowki Area
  { id: 's23', junctionName: 'Mehdipatnam Junction', location: { lat: 17.3998, lng: 78.4358 }, currentState: 'red', redTime: 68, yellowTime: 5, greenTime: 90, cycleTime: 163 },
  { id: 's24', junctionName: 'Tolichowki Junction', location: { lat: 17.4128, lng: 78.4002 }, currentState: 'green', redTime: 61, yellowTime: 5, greenTime: 82, cycleTime: 148 },
  { id: 's25', junctionName: 'Rethibowli Junction', location: { lat: 17.3886, lng: 78.3995 }, currentState: 'yellow', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  
  // Madhapur & HITEC City Area
  { id: 's26', junctionName: 'Madhapur Image Hospital Junction', location: { lat: 17.4484, lng: 78.3821 }, currentState: 'red', redTime: 56, yellowTime: 4, greenTime: 69, cycleTime: 129 },
  { id: 's27', junctionName: 'Madhapur Durgam Cheruvu', location: { lat: 17.4407, lng: 78.3870 }, currentState: 'green', redTime: 52, yellowTime: 4, greenTime: 68, cycleTime: 124 },
  { id: 's28', junctionName: 'Cyber Towers Junction', location: { lat: 17.4435, lng: 78.3772 }, currentState: 'yellow', redTime: 43, yellowTime: 3, greenTime: 63, cycleTime: 109 },
  { id: 's29', junctionName: 'HITEC City Main Road', location: { lat: 17.4479, lng: 78.3774 }, currentState: 'red', redTime: 46, yellowTime: 4, greenTime: 66, cycleTime: 116 },
  { id: 's30', junctionName: 'Shilparamam Junction', location: { lat: 17.4524, lng: 78.3663 }, currentState: 'green', redTime: 48, yellowTime: 4, greenTime: 70, cycleTime: 122 },
  
  // Gachibowli & Financial District
  { id: 's31', junctionName: 'Gachibowli Junction', location: { lat: 17.4405, lng: 78.3478 }, currentState: 'red', redTime: 63, yellowTime: 4, greenTime: 92, cycleTime: 159 },
  { id: 's32', junctionName: 'Biodiversity Park Junction', location: { lat: 17.4275, lng: 78.3719 }, currentState: 'yellow', redTime: 60, yellowTime: 4, greenTime: 88, cycleTime: 152 },
  { id: 's33', junctionName: 'Nanakramguda Junction', location: { lat: 17.4239, lng: 78.3445 }, currentState: 'green', redTime: 58, yellowTime: 4, greenTime: 80, cycleTime: 142 },
  { id: 's34', junctionName: 'Financial District Junction', location: { lat: 17.4196, lng: 78.3328 }, currentState: 'red', redTime: 55, yellowTime: 4, greenTime: 76, cycleTime: 135 },
  
  // Kondapur & Miyapur Area
  { id: 's35', junctionName: 'Kondapur RTO Junction', location: { lat: 17.4674, lng: 78.3639 }, currentState: 'green', redTime: 52, yellowTime: 5, greenTime: 70, cycleTime: 127 },
  { id: 's36', junctionName: 'Hafeezpet Junction', location: { lat: 17.4758, lng: 78.3762 }, currentState: 'yellow', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  { id: 's37', junctionName: 'Miyapur X Roads', location: { lat: 17.4948, lng: 78.3919 }, currentState: 'red', redTime: 58, yellowTime: 4, greenTime: 80, cycleTime: 142 },
  { id: 's38', junctionName: 'KPHB JNTU Junction', location: { lat: 17.4959, lng: 78.3915 }, currentState: 'green', redTime: 57, yellowTime: 4, greenTime: 77, cycleTime: 138 },
  { id: 's39', junctionName: 'Kukatpally Housing Board', location: { lat: 17.4944, lng: 78.3985 }, currentState: 'yellow', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  
  // Kukatpally & Moosapet Area
  { id: 's40', junctionName: 'Kukatpally Y Junction', location: { lat: 17.4901, lng: 78.4148 }, currentState: 'red', redTime: 62, yellowTime: 5, greenTime: 84, cycleTime: 151 },
  { id: 's41', junctionName: 'Balanagar Junction', location: { lat: 17.4775, lng: 78.4243 }, currentState: 'green', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  { id: 's42', junctionName: 'Moosapet Junction', location: { lat: 17.4649, lng: 78.4352 }, currentState: 'yellow', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  
  // Dilsukhnagar & LB Nagar Area (East)
  { id: 's43', junctionName: 'Dilsukhnagar Chaitanyapuri', location: { lat: 17.3688, lng: 78.5244 }, currentState: 'red', redTime: 65, yellowTime: 5, greenTime: 82, cycleTime: 152 },
  { id: 's44', junctionName: 'Moosarambagh Junction', location: { lat: 17.3732, lng: 78.5168 }, currentState: 'green', redTime: 58, yellowTime: 4, greenTime: 76, cycleTime: 138 },
  { id: 's45', junctionName: 'Malakpet Junction', location: { lat: 17.3881, lng: 78.5081 }, currentState: 'yellow', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  { id: 's46', junctionName: 'LB Nagar Junction', location: { lat: 17.3491, lng: 78.5526 }, currentState: 'red', redTime: 64, yellowTime: 5, greenTime: 86, cycleTime: 155 },
  { id: 's47', junctionName: 'Vanasthalipuram Junction', location: { lat: 17.3281, lng: 78.5782 }, currentState: 'green', redTime: 60, yellowTime: 4, greenTime: 82, cycleTime: 146 },
  
  // Uppal & Nacharam Area (East)
  { id: 's48', junctionName: 'Uppal Junction', location: { lat: 17.4065, lng: 78.5591 }, currentState: 'yellow', redTime: 62, yellowTime: 5, greenTime: 84, cycleTime: 151 },
  { id: 's49', junctionName: 'Habsiguda Junction', location: { lat: 17.4113, lng: 78.5369 }, currentState: 'red', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  { id: 's50', junctionName: 'Nacharam IDA Junction', location: { lat: 17.4342, lng: 78.5469 }, currentState: 'green', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  { id: 's51', junctionName: 'ECIL X Roads', location: { lat: 17.4726, lng: 78.5714 }, currentState: 'yellow', redTime: 64, yellowTime: 5, greenTime: 86, cycleTime: 155 },
  
  // Shamshabad & Airport Area (South)
  { id: 's52', junctionName: 'Shamsheergunj Junction', location: { lat: 17.2933, lng: 78.4488 }, currentState: 'red', redTime: 55, yellowTime: 4, greenTime: 72, cycleTime: 131 },
  { id: 's53', junctionName: 'Aramghar Junction', location: { lat: 17.3214, lng: 78.4331 }, currentState: 'green', redTime: 58, yellowTime: 4, greenTime: 78, cycleTime: 140 },
  
  // Patancheru (North-West)
  { id: 's54', junctionName: 'Patancheru Junction', location: { lat: 17.5339, lng: 78.2648 }, currentState: 'yellow', redTime: 60, yellowTime: 4, greenTime: 80, cycleTime: 144 },
  
  // Kompally Area (North)
  { id: 's55', junctionName: 'Kompally Junction', location: { lat: 17.5248, lng: 78.4865 }, currentState: 'red', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  { id: 's56', junctionName: 'Alwal Junction', location: { lat: 17.5039, lng: 78.5158 }, currentState: 'green', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  
  // Additional Central Junctions
  { id: 's57', junctionName: 'Chikkadpally Junction', location: { lat: 17.4038, lng: 78.4958 }, currentState: 'yellow', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  { id: 's58', junctionName: 'RTC X Roads', location: { lat: 17.4122, lng: 78.4899 }, currentState: 'red', redTime: 62, yellowTime: 5, greenTime: 84, cycleTime: 151 },
  { id: 's59', junctionName: 'Kachiguda Station Junction', location: { lat: 17.3978, lng: 78.4899 }, currentState: 'green', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  { id: 's60', junctionName: 'Himayat Nagar Junction', location: { lat: 17.3983, lng: 78.4839 }, currentState: 'yellow', redTime: 48, yellowTime: 4, greenTime: 66, cycleTime: 118 },
  { id: 's61', junctionName: 'Khairatabad Junction', location: { lat: 17.4062, lng: 78.4641 }, currentState: 'red', redTime: 64, yellowTime: 5, greenTime: 88, cycleTime: 157 },
  { id: 's62', junctionName: 'Somajiguda Circle', location: { lat: 17.4217, lng: 78.4525 }, currentState: 'green', redTime: 56, yellowTime: 4, greenTime: 76, cycleTime: 136 },
  { id: 's63', junctionName: 'Tank Bund Road Junction', location: { lat: 17.4193, lng: 78.4798 }, currentState: 'yellow', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  
  // Gandimaisamma & Nearby (User requested)
  { id: 's64', junctionName: 'Gandimaisamma Junction', location: { lat: 17.5078, lng: 78.3848 }, currentState: 'red', redTime: 58, yellowTime: 4, greenTime: 80, cycleTime: 142 },
  { id: 's65', junctionName: 'Nizampet Junction', location: { lat: 17.5124, lng: 78.3912 }, currentState: 'green', redTime: 54, yellowTime: 4, greenTime: 74, cycleTime: 132 },
  { id: 's66', junctionName: 'Bachupally Junction', location: { lat: 17.5442, lng: 78.3903 }, currentState: 'yellow', redTime: 56, yellowTime: 4, greenTime: 76, cycleTime: 136 },
  
  // Western Suburbs
  { id: 's67', junctionName: 'Lingampally Junction', location: { lat: 17.4949, lng: 78.3263 }, currentState: 'red', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  { id: 's68', junctionName: 'Manikonda Junction', location: { lat: 17.4028, lng: 78.3826 }, currentState: 'green', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  { id: 's69', junctionName: 'Narsingi Junction', location: { lat: 17.3684, lng: 78.3589 }, currentState: 'yellow', redTime: 48, yellowTime: 4, greenTime: 66, cycleTime: 118 },
  
  // Southern Areas
  { id: 's70', junctionName: 'Attapur Junction', location: { lat: 17.3711, lng: 78.4198 }, currentState: 'red', redTime: 58, yellowTime: 4, greenTime: 78, cycleTime: 140 },
  { id: 's71', junctionName: 'Falaknuma Junction', location: { lat: 17.3321, lng: 78.4893 }, currentState: 'green', redTime: 60, yellowTime: 5, greenTime: 82, cycleTime: 147 },
  { id: 's72', junctionName: 'Bahadurpura Junction', location: { lat: 17.3569, lng: 78.4878 }, currentState: 'yellow', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  
  // Northern Areas
  { id: 's73', junctionName: 'Bowenpally Junction', location: { lat: 17.4729, lng: 78.4721 }, currentState: 'red', redTime: 56, yellowTime: 4, greenTime: 74, cycleTime: 134 },
  { id: 's74', junctionName: 'Sanathnagar Junction', location: { lat: 17.4515, lng: 78.4431 }, currentState: 'green', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  { id: 's75', junctionName: 'Malkajgiri Junction', location: { lat: 17.4475, lng: 78.5271 }, currentState: 'yellow', redTime: 58, yellowTime: 4, greenTime: 78, cycleTime: 140 },
  
  // Eastern Intermediate
  { id: 's76', junctionName: 'Ramanthapur Junction', location: { lat: 17.4215, lng: 78.5514 }, currentState: 'red', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  { id: 's77', junctionName: 'Tarnaka Junction', location: { lat: 17.4261, lng: 78.5352 }, currentState: 'green', redTime: 60, yellowTime: 5, greenTime: 82, cycleTime: 147 },
  { id: 's78', junctionName: 'Osmania University Junction', location: { lat: 17.4173, lng: 78.5289 }, currentState: 'yellow', redTime: 48, yellowTime: 4, greenTime: 66, cycleTime: 118 },
  
  // High Court & Administrative Area
  { id: 's79', junctionName: 'High Court Junction', location: { lat: 17.4065, lng: 78.4743 }, currentState: 'red', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },
  { id: 's80', junctionName: 'Assembly Junction', location: { lat: 17.3976, lng: 78.4711 }, currentState: 'green', redTime: 56, yellowTime: 4, greenTime: 76, cycleTime: 136 },
  
  // Additional Tech Corridor Roads
  { id: 's81', junctionName: 'Kothaguda Junction', location: { lat: 17.4623, lng: 78.3658 }, currentState: 'yellow', redTime: 50, yellowTime: 4, greenTime: 68, cycleTime: 122 },
  { id: 's82', junctionName: 'Mindspace Junction', location: { lat: 17.4317, lng: 78.3852 }, currentState: 'red', redTime: 46, yellowTime: 3, greenTime: 64, cycleTime: 113 },
  { id: 's83', junctionName: 'Ayyappa Society Junction', location: { lat: 17.4178, lng: 78.3973 }, currentState: 'green', redTime: 48, yellowTime: 4, greenTime: 66, cycleTime: 118 },
  
  // Additional Southern Routes
  { id: 's84', junctionName: 'Rajendra Nagar Junction', location: { lat: 17.3531, lng: 78.4236 }, currentState: 'yellow', redTime: 54, yellowTime: 4, greenTime: 72, cycleTime: 130 },
  { id: 's85', junctionName: 'Shaikpet Junction', location: { lat: 17.3924, lng: 78.4169 }, currentState: 'red', redTime: 52, yellowTime: 4, greenTime: 70, cycleTime: 126 },

  // Officer-managed corridors (manual override by traffic officer)
  { id: 's86', junctionName: 'Banjara Hills Road No. 10 Control Junction', location: { lat: 17.4168, lng: 78.4364 }, currentState: 'red', redTime: 54, yellowTime: 4, greenTime: 74, cycleTime: 132 },
  { id: 's87', junctionName: 'Punjagutta Flyover Down Ramp', location: { lat: 17.4298, lng: 78.4512 }, currentState: 'yellow', redTime: 52, yellowTime: 4, greenTime: 72, cycleTime: 128 },
  { id: 's88', junctionName: 'Ameerpet Y-Point Officer Booth', location: { lat: 17.4362, lng: 78.4448 }, currentState: 'green', redTime: 50, yellowTime: 4, greenTime: 70, cycleTime: 124 },
  { id: 's89', junctionName: 'Madhapur Police Traffic Cabin', location: { lat: 17.4468, lng: 78.3862 }, currentState: 'red', redTime: 48, yellowTime: 4, greenTime: 68, cycleTime: 120 },
  { id: 's90', junctionName: 'Gachibowli ORR Exit Signal Cabin', location: { lat: 17.4376, lng: 78.3552 }, currentState: 'yellow', redTime: 58, yellowTime: 4, greenTime: 80, cycleTime: 142 },
];

export const OFFICER_OPERATED_SIGNAL_IDS = [
  's6',
  's16',
  's21',
  's23',
  's28',
  's31',
  's40',
  's46',
  's58',
  's64',
  's73',
  's79',
  's82',
  's86',
  's87',
  's88',
  's89',
  's90',
];

export const HYDERABAD_SIGNALS = RAW_HYDERABAD_SIGNALS.map((signal) => ({
  ...signal,
  controlType: OFFICER_OPERATED_SIGNAL_IDS.includes(signal.id) ? 'officer' : 'automatic',
}));
