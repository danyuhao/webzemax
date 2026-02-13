
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, Send } from 'lucide-react';
import { Surface } from '../types';

interface Props {
  onApplyLens: (surfaces: Surface[]) => void;
}

export const AISuggestions: React.FC<Props> = ({ onApplyLens }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLens = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Design an optical lens system based on this request: "${prompt}". Return a JSON array of surfaces compatible with this schema: 
        { radius: number, thickness: number, refractiveIndex: number, material: string, semiDiameter: number, name: string }.
        Example common designs: Cooke Triplet, Petzval, Double Gauss.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                radius: { type: Type.NUMBER },
                thickness: { type: Type.NUMBER },
                material: { type: Type.STRING },
                refractiveIndex: { type: Type.NUMBER },
                semiDiameter: { type: Type.NUMBER }
              },
              required: ["name", "radius", "thickness", "material", "refractiveIndex", "semiDiameter"]
            }
          }
        }
      });

      const rawData = JSON.parse(response.text);
      const surfaces: Surface[] = rawData.map((s: any) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        comment: 'AI Generated'
      }));
      onApplyLens(surfaces);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
      <h3 className="text-indigo-900 font-semibold mb-2 flex items-center gap-2">
        <Sparkles size={18} className="text-indigo-600" />
        AI Design Assistant
      </h3>
      <p className="text-indigo-700 text-xs mb-3 leading-relaxed">
        Describe a lens (e.g., "A Cooke Triplet for 50mm focus") and the AI will generate the prescription for you.
      </p>
      <div className="relative">
        <input 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Try 'Cooke Triplet' or 'F/2 Objective'..."
          className="w-full bg-white border border-indigo-200 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          onKeyDown={(e) => e.key === 'Enter' && generateLens()}
        />
        <button 
          onClick={generateLens}
          disabled={loading || !prompt}
          className="absolute right-1 top-1 bottom-1 px-2 text-indigo-600 hover:text-indigo-800 disabled:text-indigo-300 transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};
