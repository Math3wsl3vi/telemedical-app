'use client';

import React, { useState } from 'react';
import { FileText, Pill, Plus, X, ChevronDown, ChevronUp, Clock, Trash2, Save } from 'lucide-react';
import { savePrescription, Medication as MedicationType, DoctorNote as DoctorNoteType } from '@/lib/appointments';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  duration: string;
  quantity: string;
}

interface DoctorNote {
  id: string;
  timestamp: Date;
  content: string;
  type: 'diagnosis' | 'observation' | 'plan';
}

interface DoctorConsultationPanelProps {
  patientId?: string; // Reserved for future use
  appointmentId?: string;
  doctorId?: string;
}

const DoctorConsultationPanel: React.FC<DoctorConsultationPanelProps> = ({ 
  appointmentId,
  doctorId,
}) => {
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteType, setNoteType] = useState<'diagnosis' | 'observation' | 'plan'>('observation');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Medication form state
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    strength: '',
    dosage: '',
    duration: '',
    quantity: ''
  });

  const addNote = () => {
    if (!currentNote.trim()) return;

    const newNote: DoctorNote = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content: currentNote,
      type: noteType,
    };

    setNotes([newNote, ...notes]);
    setCurrentNote('');
  };

  const addMedication = () => {
    if (!medForm.name.trim()) return;

    const newMed: Medication = {
      id: Date.now().toString(),
      ...medForm
    };

    setMedications([...medications, newMed]);
    setMedForm({
      name: '',
      strength: '',
      dosage: '',
      duration: '',
      quantity: ''
    });
    setShowMedForm(false);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const savePrescriptionToFirestore = async () => {
    if (!appointmentId || !doctorId) {
      toast({ 
        title: "Error", 
        description: "Cannot save prescription: Missing appointment or doctor information.",
        variant: "destructive" 
      });
      return;
    }

    if (medications.length === 0 && notes.length === 0) {
      toast({ 
        title: "Nothing to save", 
        description: "Please add at least one medication or note.",
        variant: "destructive" 
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert local types to Firestore types
      const prescriptionData = {
        medications: medications.map(med => ({
          ...med,
          price: 0 // You can add price input if needed
        })) as MedicationType[],
        notes: notes.map(note => ({
          ...note,
          timestamp: note.timestamp
        })) as DoctorNoteType[],
      };

      await savePrescription(appointmentId, prescriptionData, doctorId);
      
      toast({ 
        title: "Success", 
        description: "Prescription saved successfully!",
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save prescription. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'bg-red-900/30 border-red-700 text-red-300';
      case 'plan': return 'bg-blue-900/30 border-blue-700 text-blue-300';
      default: return 'bg-green-900/30 border-green-700 text-green-300';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 border-l border-gray-700 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">Consultation Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {appointmentId && (
            <button
              onClick={savePrescriptionToFirestore}
              disabled={isSaving || (medications.length === 0 && notes.length === 0)}
              className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Saving...' : 'Save All'}
            </button>
          )}
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
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* Medications Section */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                Prescribed Medications
              </h4>
              <button
                onClick={() => setShowMedForm(!showMedForm)}
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Med
              </button>
            </div>

            {/* Medication Form */}
            {showMedForm && (
              <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-3 space-y-2">
                <input
                  type="text"
                  placeholder="Medication name *"
                  value={medForm.name}
                  onChange={(e) => setMedForm({...medForm, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Strength (e.g., 500mg)"
                    value={medForm.strength}
                    onChange={(e) => setMedForm({...medForm, strength: e.target.value})}
                    className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={medForm.quantity}
                    onChange={(e) => setMedForm({...medForm, quantity: e.target.value})}
                    className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Dosage (e.g., Take 1 tablet twice daily)"
                  value={medForm.dosage}
                  onChange={(e) => setMedForm({...medForm, dosage: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 7 days)"
                  value={medForm.duration}
                  onChange={(e) => setMedForm({...medForm, duration: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={addMedication}
                    disabled={!medForm.name.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded text-sm transition-colors"
                  >
                    Add Medication
                  </button>
                  <button
                    onClick={() => setShowMedForm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Medications List */}
            {medications.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No medications prescribed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div key={med.id} className="bg-gray-800 border border-gray-700 rounded p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{med.name} {med.strength}</p>
                        <p className="text-xs text-gray-400 mt-1">{med.dosage}</p>
                      </div>
                      <button
                        onClick={() => removeMedication(med.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Duration: {med.duration}</span>
                      <span>Qty: {med.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes Input Section */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Add Clinical Note
            </h4>
            
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setNoteType('observation')}
                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                  noteType === 'observation'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Observation
              </button>
              <button
                onClick={() => setNoteType('diagnosis')}
                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                  noteType === 'diagnosis'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Diagnosis
              </button>
              <button
                onClick={() => setNoteType('plan')}
                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                  noteType === 'plan'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Plan
              </button>
            </div>
            
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Document observations, diagnosis, or treatment plan..."
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
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Consultation History</h4>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notes yet</p>
                <p className="text-xs mt-1">Document the consultation as you go</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className={`border rounded p-3 ${getNoteTypeColor(note.type)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase">
                          {note.type}
                        </span>
                        <span className="text-xs opacity-60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm break-words">{note.content}</p>
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

export default DoctorConsultationPanel;