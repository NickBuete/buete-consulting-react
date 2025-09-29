import React, { useState } from 'react'
import type { Patient } from '../../types/hmr'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/Dialog'

// DRY: Use patients array and createPatient from parent (useHmrDashboard)
export function PatientList({
  patients,
  onDelete,
  onUpdate,
}: {
  patients: Patient[]
  onDelete?: (id: number) => void
  onUpdate?: (id: number, data: Partial<Patient>) => void
}) {
  const [selected, setSelected] = useState<Patient | null>(null)
  const [edit, setEdit] = useState<Partial<Patient> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = (patient: Patient) => {
    setSelected(patient)
    setEdit(patient)
    setModalOpen(true)
  }
  const closeModal = () => {
    setSelected(null)
    setEdit(null)
    setModalOpen(false)
  }

  const handleChange = (field: keyof Patient, value: any) => {
    setEdit((prev) => ({ ...prev!, [field]: value }))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Patients</h2>
      {patients.length > 0 ? (
        <ul className="mb-6">
          {patients.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center py-2 border-b cursor-pointer"
              onClick={() => openModal(p)}
            >
              <span>
                {p.firstName} {p.lastName}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 mb-6">No patients found.</div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {edit && (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (selected && onUpdate) {
                  onUpdate(selected.id, edit)
                  closeModal()
                }
              }}
            >
              <input
                className="border px-2 py-1 w-full"
                placeholder="First Name"
                value={edit.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-full"
                placeholder="Last Name"
                value={edit.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-full"
                placeholder="Phone"
                value={edit.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-full"
                placeholder="Email"
                value={edit.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-full"
                placeholder="Address Line 1"
                value={edit.addressLine1 || ''}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-full"
                placeholder="Suburb"
                value={edit.suburb || ''}
                onChange={(e) => handleChange('suburb', e.target.value)}
              />
              {/* Add more fields as needed */}
              <DialogFooter>
                {selected && onDelete && (
                  <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => {
                      onDelete(selected.id)
                      closeModal()
                    }}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <DialogClose asChild>
                  <button type="button" className="ml-2 text-gray-500">
                    Cancel
                  </button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
