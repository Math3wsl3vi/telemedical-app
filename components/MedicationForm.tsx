'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

export interface Medication {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface MedicationFormProps {
  onSave: (medications: Medication[]) => Promise<void>;
  initialMedications?: Medication[];
  isLoading?: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  onSave,
  initialMedications = [],
  isLoading = false,
}) => {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [isSaving, setIsSaving] = useState(false);

  const addMedicationField = () => {
    setMedications([
      ...medications,
      {
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
      },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSave = async () => {
    const isValid = medications.every(
      (med) => med.medication_name && med.dosage && med.frequency && med.duration
    );
    if (!isValid) {
      alert('Please fill in all required fields for each medication');
      return;
    }
    setIsSaving(true);  
    try {
      await onSave(medications);
      alert('Medications saved successfully');
    } catch (error) {
        console.log(error)
      alert('Failed to save medications. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Prescribe Medications</h3>
      <div className="space-y-4">
        {medications.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-3">No medications added yet</p>
            <Button onClick={addMedicationField} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Add First Medication
            </Button>
          </div>
        ) : (
          <>
            {medications.map((medication, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-700">Medication {index + 1}</h4>
                  <button
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name *
                    </label>
                    <Input
                      placeholder="e.g., Amoxicillin"
                      value={medication.medication_name}
                      onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <Input
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <Input
                      placeholder="e.g., 3 times daily, As needed"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <Input
                      placeholder="e.g., 7 days, 2 weeks"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <Textarea
                    placeholder="e.g., Take with food, Avoid dairy products"
                    value={medication.notes}
                    onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                    rows={2}
                    className="border-gray-300"
                  />
                </div>
              </div>
            ))}
            <Button
              onClick={addMedicationField}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Medication
            </Button>
          </>
        )}
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading || medications.length === 0}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          {isSaving ? 'Saving...' : 'Save Medications'}
        </Button>
      </div>
    </div>
  );
};

export default MedicationForm;
