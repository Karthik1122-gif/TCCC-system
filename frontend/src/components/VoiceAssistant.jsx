import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const VoiceAssistant = ({ onHospitalRanked }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const token = useAuthStore(state => state.user?.token);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) return;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      processEmergency(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!recognition) return alert('Speech Recognition not supported in this browser.');
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const processEmergency = async (patientDetails) => {
    setIsProcessing(true);
    try {
      const mockHospitals = [
        "Apollo Hospital Jubilee Hills", 
        "Yashoda Hospital Somajiguda", 
        "Care Hospital Banjara Hills"
      ];
      
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/hospital-rank`,
        { patientDetails, hospitals: mockHospitals },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onHospitalRanked(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 mt-4">
      <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
        🎤 AI Voice Dispatch
      </h3>
      <p className="text-xs text-gray-400 mb-4">Click and state patient details for AI hospital routing.</p>
      
      <button 
        onClick={toggleListening}
        className={`w-full py-2 rounded font-bold transition ${isListening ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {isListening ? 'Listening...' : 'Start Voice Intake'}
      </button>

      {transcript && (
        <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-600">
           <p className="text-sm italic text-gray-300">"{transcript}"</p>
        </div>
      )}

      {isProcessing && <p className="text-sm text-amber-400 mt-2">Claude is ranking hospitals...</p>}
    </div>
  );
};

export default VoiceAssistant;

