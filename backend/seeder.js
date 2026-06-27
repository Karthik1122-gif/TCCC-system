const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Signal = require('./models/Signal');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const signals = [
  { name: "Panjagutta Junction", lat: 17.4314, lng: 78.4484, zone: "Banjara Hills" },
  { name: "Begumpet Signal", lat: 17.4441, lng: 78.4610, zone: "Begumpet" },
  { name: "Hitech City Junction", lat: 17.4436, lng: 78.3783, zone: "Hitech City" },
  { name: "Secunderabad Clock Tower", lat: 17.4399, lng: 78.4983, zone: "Secunderabad" },
  { name: "LB Nagar X-Roads", lat: 17.3562, lng: 78.5482, zone: "LB Nagar" },
  { name: "Mehdipatnam Signal", lat: 17.3947, lng: 78.4333, zone: "Mehdipatnam" },
  { name: "Ameerpet Junction", lat: 17.4375, lng: 78.4484, zone: "Ameerpet" },
  { name: "Tarnaka Signal", lat: 17.4318, lng: 78.5385, zone: "Tarnaka" },
  { name: "KPHB Colony X-Roads", lat: 17.4908, lng: 78.3908, zone: "KPHB" },
  { name: "Dilsukhnagar Signal", lat: 17.3686, lng: 78.5279, zone: "Dilsukhnagar" }
];

const importData = async () => {
  try {
    await Signal.deleteMany();
    await Signal.insertMany(signals);
    console.log('Signals Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Signal.deleteMany();
    console.log('Signals Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
