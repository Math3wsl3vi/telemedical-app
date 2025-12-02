'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Pill } from 'lucide-react'
import { Medication } from './MedicationForm'

interface PrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (medications: Medication[]) => Promise<void>
  isDoctor: boolean
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isDoctor
}) => {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      }
    ])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const handleSave = async () => {
    if (medications.length === 0 || !medications.every(m => m.medication_name && m.dosage && m.frequency && m.duration)) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      await onSave(medications)
      setMedications([])
      onClose()
    } catch (error) {
      console.error('Error saving medications:', error)
      alert('Failed to save medications')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-green-600" />
            <DialogTitle>Prescribe Medications</DialogTitle>
          </div>
          <DialogDescription>
            {isDoctor 
              ? 'Add medications to prescribe to the patient. They will confirm these after the consultation ends.'
              : 'Review the medications prescribed by your doctor.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {medications.length === 0 && isDoctor ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No medications added yet</p>
              <Button
                onClick={addMedication}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
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
                    {isDoctor && (
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Medication Name
                      </label>
                      <Input
                        placeholder="e.g., Amoxicillin"
                        value={medication.medication_name}
                        onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                        disabled={!isDoctor}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Dosage
                      </label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        disabled={!isDoctor}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Frequency
                      </label>
                      <Input
                        placeholder="e.g., 3 times daily"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        disabled={!isDoctor}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Duration
                      </label>
                      <Input
                        placeholder="e.g., 7 days"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        disabled={!isDoctor}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {medication.notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Special Instructions
                      </label>
                      <Textarea
                        value={medication.notes}
                        onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                        disabled={!isDoctor}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}

              {isDoctor && (
                <Button
                  onClick={addMedication}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              )}
            </>
          )}
        </div>

        {isDoctor && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || medications.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Save Medications'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PrescriptionModal
