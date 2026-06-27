const asyncHandler = require('express-async-handler');
const Signal = require('../models/Signal');

// @desc    Fetch all signals
// @route   GET /api/signals
// @access  Public
const getSignals = asyncHandler(async (req, res) => {
  const signals = await Signal.find({});
  res.json(signals);
});

// @desc    Update signal status (e.g. extending green time)
// @route   PUT /api/signals/:id
// @access  Private/Police
const overrideSignal = asyncHandler(async (req, res) => {
  // Logic for traffic police to manually override the signal
  // In a real scenario, this would interface with ATSC IoT systems
  const signal = await Signal.findById(req.params.id);

  if (signal) {
    // We can emit a socket event here if we choose
    res.json({ message: 'Signal overridden successfully', signal });
  } else {
    res.status(404);
    throw new Error('Signal not found');
  }
});

module.exports = { getSignals, overrideSignal };
