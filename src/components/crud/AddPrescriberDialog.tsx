import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui'

export interface AddPrescriberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: any
  clinics: Array<{ id: number; name: string }>
  formMode: 'existing' | 'new'
  setFormMode: (mode: 'existing' | 'new') => void
  onSubmit: (values: any) => Promise<void>
  onCancel: () => void
}

export const AddPrescriberDialog: React.FC<AddPrescriberDialogProps> = ({
  open,
  onOpenChange,
  form,
  clinics,
  formMode,
  setFormMode,
  onSubmit,
  onCancel,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Prescriber</DialogTitle>
        <DialogDescription>
          Link the prescriber to an existing clinic or create a new clinic in
          one step.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="prescriber@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Clinic</FormLabel>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formMode === 'existing' ? 'default' : 'outline'}
                onClick={() => setFormMode('existing')}
              >
                Existing
              </Button>
              <Button
                type="button"
                variant={formMode === 'new' ? 'default' : 'outline'}
                onClick={() => setFormMode('new')}
              >
                New Clinic
              </Button>
            </div>
          </div>
          {formMode === 'existing' ? (
            <FormField
              control={form.control}
              name="clinicSelection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select clinic</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.length === 0 ? (
                          <SelectItem value="no-clinic">
                            No clinics available
                          </SelectItem>
                        ) : (
                          clinics.map((clinic) => (
                            <SelectItem
                              key={clinic.id}
                              value={String(clinic.id)}
                            >
                              {clinic.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic name</FormLabel>
                    <FormControl>
                      <Input placeholder="Example Medical Centre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinicEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic email</FormLabel>
                    <FormControl>
                      <Input placeholder="team@examplemedical.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinicPhone"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Clinic phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Clinic contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Prescriber'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
)
