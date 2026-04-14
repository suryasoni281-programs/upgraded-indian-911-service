// Mock Backend Simulation
export const MOCK_USER = {
  id: 'u-1234',
  name: 'John Doe',
  phone: '+1 234 567 8900',
  bloodGroup: 'O+',
  medicalConditions: 'None',
  isOffline: false
};

export const MOCK_CONTACTS = [
  { id: 'c-1', name: 'Jane Doe (Wife)', phone: '+1 234 567 8901' },
  { id: 'c-2', name: 'Dad', phone: '+1 234 567 8902' }
];

export const MOCK_UNITS = {
  police: [
    { id: 'p-1', service: 'police', name: 'Unit 42', status: 'available', distance: 1.2, eta: 4, coords: { lat: 30, lng: 20 } },
    { id: 'p-2', service: 'police', name: 'Unit 17', status: 'available', distance: 3.5, eta: 8, coords: { lat: 80, lng: 10 } }
  ],
  ambulance: [
    { id: 'a-1', service: 'ambulance', name: 'City Med 1', status: 'available', distance: 2.1, eta: 5, coords: { lat: 70, lng: 70 } }
  ],
  fire: [
    { id: 'f-1', service: 'fire', name: 'Engine 5', status: 'available', distance: 4.0, eta: 10, coords: { lat: 10, lng: 80 } }
  ],
  railway: [
    { id: 'r-1', service: 'railway', name: 'Station Security', status: 'available', distance: 0.5, eta: 2, coords: { lat: 40, lng: 40 } }
  ]
};

// Functions to simulate backend processes
export const backendSim = {
  getNearestUnit: (serviceType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const units = MOCK_UNITS[serviceType];
        if (units && units.length > 0) {
          // Sort by distance and return first
          const unit = [...units].sort((a, b) => a.distance - b.distance)[0];
          resolve(unit);
        } else {
          resolve(null);
        }
      }, 800); // Network delay simulation
    });
  },

  createEmergencyRequest: (type, unitsAssigned) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `req-${Math.floor(Math.random() * 10000)}`,
          type,
          status: 'assigned',
          units: unitsAssigned,
          createdAt: new Date().toISOString()
        });
      }, 1200);
    });
  },

  analyzeImage: async (base64Image) => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey && base64Image) {
      try {
        const base64Data = base64Image.split(',')[1];
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             contents: [
               {
                 parts: [
                   { text: "Analyze this image to determine if there is an emergency. Evaluate the severity. Respond ONLY with a valid JSON object matching this exact structure: { \"isEmergency\": boolean, \"detected\": \"string of what you see\", \"confidence\": number (0-100), \"advice\": \"string suggestion\", \"service\": \"police\" | \"ambulance\" | \"fire\" | \"railway\" | \"universal\" | \"none\" }" },
                   {
                     inlineData: {
                       mimeType: "image/jpeg",
                       data: base64Data
                     }
                   }
                 ]
               }
             ],
             generationConfig: {
               responseMimeType: "application/json"
             }
          })
        });

        if (!response.ok) throw new Error(`API Request Failed: ${response.statusText}`);
        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        
        return JSON.parse(jsonText);
      } catch (err) {
        console.error("Gemini AI failed, using fallback mock", err);
      }
    }

    // Fallback Mock System if no API key or failed
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = [
          { isEmergency: true, detected: 'Structure Fire', confidence: 94, advice: 'Call Fire Brigade', service: 'fire' },
          { isEmergency: true, detected: 'Traffic Collision', confidence: 88, advice: 'Dispatch Ambulance', service: 'ambulance' },
          { isEmergency: false, detected: 'Empty Street', confidence: 98, advice: 'No action needed', service: 'none' }
        ];
        resolve(results[Math.floor(Math.random() * results.length)]);
      }, 2000);
    });
  }
};
