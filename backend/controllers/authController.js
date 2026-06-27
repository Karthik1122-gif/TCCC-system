const jwt = require('jsonwebtoken');
const User = require('../models/User');

const OFFICER_OPERATED_SIGNAL_IDS = new Set([
  's6', 's16', 's21', 's23', 's28', 's31', 's40', 's46', 's58',
  's64', 's73', 's79', 's82', 's86', 's87', 's88', 's89', 's90'
]);

const normalizeText = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const scoreJunctionMatch = (signalJunction, officerJunction) => {
  const a = normalizeText(signalJunction);
  const b = normalizeText(officerJunction);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 80;

  const aTokens = new Set(a.split(' ').filter(Boolean));
  const bTokens = b.split(' ').filter(Boolean);
  const overlap = bTokens.filter((token) => aTokens.has(token)).length;
  return overlap * 20;
};

const useMockData = () => process.env.USE_MOCK_DATA === 'true';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  if (useMockData()) {
    return res.json({
      _id: 'dummy123',
      name: email.split('@')[0],
      email,
      role: email.includes('police') ? 'police' : 'driver',
      token: generateToken('dummy123'),
      vehicleNumber: 'TS09AB1234',
      junctionLocation: 'Banjara Hills',
      phoneNumber: '9876543210'
    });
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
    vehicleNumber: user.vehicleNumber,
    junctionLocation: user.junctionLocation,
    phoneNumber: user.phoneNumber
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, role, vehicleNumber, junctionLocation, phoneNumber } = req.body;

  if ((role || 'driver') === 'police' && !/^\d{10}$/.test(String(phoneNumber || '').trim())) {
    res.status(400);
    throw new Error('Police phone number is required and must be 10 digits');
  }

  if (useMockData()) {
    return res.status(201).json({
      _id: 'dummy123',
      name,
      email,
      role: role || 'driver',
      token: generateToken('dummy123'),
      vehicleNumber,
      junctionLocation,
      phoneNumber
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'driver',
    vehicleNumber,
    junctionLocation,
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
    vehicleNumber: user.vehicleNumber,
    junctionLocation: user.junctionLocation,
    phoneNumber: user.phoneNumber
  });
};

const getOfficerContactsForRoute = async (req, res) => {
  const officerSignals = Array.isArray(req.body?.officerSignals) ? req.body.officerSignals : [];

  const validOfficerSignals = officerSignals.filter((signal) =>
    signal && signal.signalId && OFFICER_OPERATED_SIGNAL_IDS.has(signal.signalId)
  );

  if (validOfficerSignals.length === 0) {
    return res.json({ officers: [] });
  }

  if (useMockData()) {
    return res.json({
      officers: validOfficerSignals.slice(0, 2).map((signal, index) => ({
        officerId: `mock-officer-${index + 1}`,
        name: index === 0 ? 'Officer R. Kumar' : 'Officer S. Priya',
        phoneNumber: index === 0 ? '9988776655' : '9911223344',
        junctionLocation: signal.junctionName,
        matchedSignalId: signal.signalId,
        matchedSignalJunction: signal.junctionName
      }))
    });
  }

  const officers = await User.find({ role: 'police' })
    .select('_id name phoneNumber junctionLocation')
    .lean();

  const bestBySignal = validOfficerSignals.map((signal) => {
    const scored = officers
      .map((officer) => ({
        officer,
        score: scoreJunctionMatch(signal.junctionName, officer.junctionLocation)
      }))
      .filter((item) => item.score >= 20 && item.officer.phoneNumber)
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best) return null;

    return {
      officerId: best.officer._id,
      name: best.officer.name,
      phoneNumber: best.officer.phoneNumber,
      junctionLocation: best.officer.junctionLocation,
      matchedSignalId: signal.signalId,
      matchedSignalJunction: signal.junctionName,
      score: best.score
    };
  }).filter(Boolean);

  const deduped = Array.from(new Map(bestBySignal.map((item) => [String(item.officerId), item])).values());
  res.json({ officers: deduped });
};

module.exports = { authUser, registerUser, getOfficerContactsForRoute };
