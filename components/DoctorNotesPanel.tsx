'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Heart, Thermometer, Activity, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PatientVitals {
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
  oxygenLevel?: number;
  respiratoryRate?: number;
}

interface DoctorNote {
  id: string;
  timestamp: Date;
  content: string;
}

interface DoctorNotesPanelProps {
  patientId?: string;
}

const DoctorNotesPanel: React.FC<DoctorNotesPanelProps> = ({ 
  patientId, 
}) => {
  const [vitals, setVitals] = useState<PatientVitals>({});
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch patient vitals and notes (placeholder)
  useEffect(() => {
    // In a real app, this would fetch from Firestore
    // For now, we'll use mock data
    setVitals({
      heartRate: 78,
      bloodPressure: '120/80',
      temperature: 37.2,
      oxygenLevel: 98,
      respiratoryRate: 16,
    });
  }, [patientId]);

  const addNote = () => {
    if (!currentNote.trim()) return;

    const newNote: DoctorNote = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content: currentNote,
    };

    setNotes([newNote, ...notes]);
    setCurrentNote('');

    // In a real app, save to Firestore
    console.log('Note saved:', newNote);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">Doctor Notes & Vitals</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Patient Vitals Section */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Patient Vitals
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Heart Rate */}
              {vitals.heartRate !== undefined && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-400">Heart Rate</span>
                  </div>
                  <p className="text-xl font-semibold">{vitals.heartRate}</p>
                  <p className="text-xs text-gray-500">bpm</p>
                </div>
              )}

              {/* Temperature */}
              {vitals.temperature !== undefined && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-400">Temperature</span>
                  </div>
                  <p className="text-xl font-semibold">{vitals.temperature}</p>
                  <p className="text-xs text-gray-500">°C</p>
                </div>
              )}

              {/* Blood Pressure */}
              {vitals.bloodPressure && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-400">Blood Pressure</span>
                  </div>
                  <p className="text-xl font-semibold">{vitals.bloodPressure}</p>
                  <p className="text-xs text-gray-500">mmHg</p>
                </div>
              )}

              {/* Oxygen Level */}
              {vitals.oxygenLevel !== undefined && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-400">O₂ Level</span>
                  </div>
                  <p className="text-xl font-semibold">{vitals.oxygenLevel}</p>
                  <p className="text-xs text-gray-500">%</p>
                </div>
              )}

              {/* Respiratory Rate */}
              {vitals.respiratoryRate !== undefined && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs text-gray-400">Respiratory Rate</span>
                  </div>
                  <p className="text-xl font-semibold">{vitals.respiratoryRate}</p>
                  <p className="text-xs text-gray-500">breaths/min</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Input Section */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Add Clinical Notes
            </h4>
            
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add observations, diagnoses, or treatment notes..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
              rows={4}
            />
            
            <button
              onClick={addNote}
              disabled={!currentNote.trim()}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Save Note
            </button>
          </div>

          {/* Previous Notes Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Clinical Notes History</h4>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notes yet</p>
                <p className="text-xs mt-1">Add notes to document the consultation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-800 border border-gray-700 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">
                        {note.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-100 break-words">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorNotesPanel;
