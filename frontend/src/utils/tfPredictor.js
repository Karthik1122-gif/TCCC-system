import * as tf from '@tensorflow/tfjs';

// A mock pre-trained model for predicting ETA (in minutes) based on distance (in km) and traffic congestion level (1-10)
export const trainAndPredictETA = async (distanceKm, congestionLevel) => {
  // Try to use a very simple linear regression model
  // ETA = m1 * distance + m2 * congestion + b
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [2] }));

  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Dummy Training Data
  const xs = tf.tensor2d([
    [2, 3], // 2km, light traffic
    [5, 5], // 5km, medium traffic
    [10, 8], // 10km, heavy traffic
    [1, 1], // 1km, very light
    [15, 9] // 15km, terrible traffic
  ]);

  // Labels: ETA in minutes
  const ys = tf.tensor2d([
    [5], 
    [15], 
    [40], 
    [2], 
    [65]
  ]);

  // Train the model quickly for demo purposes
  await model.fit(xs, ys, { epochs: 50, verbose: 0 });

  // Predict
  const input = tf.tensor2d([[distanceKm, congestionLevel]]);
  const prediction = model.predict(input);
  const data = await prediction.data();
  
  // Clean up memory
  xs.dispose();
  ys.dispose();
  input.dispose();
  prediction.dispose();

  return Math.max(1, Math.round(data[0])); // Return at least 1 minute
};
