import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import {
  getDateRangeForAllMedications,
  getMonthsInRange,
  generateCalendarDays,
  formatDose,
  formatDate,
  getScheduleTypeLabel,
  getScheduleDescription,
  calculatePreparationSummary,
} from '../../utils/doseCalculation';
import type { PatientDetails, MedicationSchedule, DoseEntry, CalendarDay, TabletBreakdown } from '../../types/doseCalculator';
import { DOSE_TIME_SHORT_LABELS } from '../../types/doseCalculator';

// PDF Color mapping from Tailwind colors
const PDF_COLORS = {
  blue: { bg: '#DBEAFE', border: '#93C5FD', text: '#1E3A8A' },
  green: { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
  purple: { bg: '#E9D5FF', border: '#C084FC', text: '#5B21B6' },
  orange: { bg: '#FED7AA', border: '#FB923C', text: '#9A3412' },
  pink: { bg: '#FCE7F3', border: '#F9A8D4', text: '#831843' },
  indigo: { bg: '#E0E7FF', border: '#A5B4FC', text: '#3730A3' },
};

const getMedicationPDFColor = (index: number) => {
  const colors = [
    PDF_COLORS.blue,
    PDF_COLORS.green,
    PDF_COLORS.purple,
    PDF_COLORS.orange,
    PDF_COLORS.pink,
    PDF_COLORS.indigo,
  ];
  return colors[index % colors.length];
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
  },
  patientColumn: {
    width: '48%',
  },
  infoRow: {
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
  },
  medicationsLegend: {
    marginTop: 8,
  },
  legendTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 4,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    width: '100%',
    fontSize: 8,
    marginBottom: 2,
  },
  monthTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 5,
  },
  calendarTable: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#333',
  },
  dayHeader: {
    width: '14.28%',
    padding: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  dayCell: {
    width: '14.28%',
    borderWidth: 1,
    borderColor: '#333',
    padding: 3,
  },
  dayCellOtherMonth: {
    backgroundColor: '#F9FAFB',
  },
  dayNumber: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  dayNumberOtherMonth: {
    color: '#9CA3AF',
  },
  doseEntry: {
    marginBottom: 3,
    padding: 2,
    borderRadius: 2,
    borderWidth: 1,
  },
  doseEntryOff: {
    opacity: 0.6,
  },
  doseName: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  doseAmount: {
    fontSize: 7,
  },
  doseOff: {
    fontSize: 7,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  tabletBreakdown: {
    fontSize: 6,
    color: '#6B7280',
    marginTop: 1,
  },
  doseTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  doseTimeLabel: {
    fontSize: 6,
    color: '#6B7280',
  },
  doseTimeValue: {
    fontSize: 6,
  },
  doseTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#D1D5DB',
    marginTop: 1,
    paddingTop: 1,
  },
  doseTotalLabel: {
    fontSize: 5,
    color: '#9CA3AF',
  },
  doseTotalValue: {
    fontSize: 5,
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    fontSize: 7,
    color: '#6B7280',
  },
  preparationSummary: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 4,
  },
  preparationTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#0369A1',
  },
  preparationItem: {
    fontSize: 8,
    marginBottom: 2,
    color: '#0C4A6E',
  },
});

// Format tablet breakdown for PDF
function formatTabletBreakdownPDF(breakdown: TabletBreakdown[]): string {
  return breakdown
    .map(b => {
      const qty = b.quantity === 0.5 ? '½' : b.quantity.toString();
      return `${qty}× ${b.preparation.strength}${b.preparation.unit}`;
    })
    .join(' + ');
}

interface DoseCalendarPDFProps {
  patient: PatientDetails;
  medications: MedicationSchedule[];
  calculatedDoses: Map<string, DoseEntry[]>;
}

export const DoseCalendarPDF: React.FC<DoseCalendarPDFProps> = ({
  patient,
  medications,
  calculatedDoses,
}) => {
  // Get all months to render
  const months = React.useMemo(() => {
    const dateRange = getDateRangeForAllMedications(calculatedDoses);
    if (!dateRange) return [];
    return getMonthsInRange(dateRange.start, dateRange.end);
  }, [calculatedDoses]);

  // Create medication index map for colors
  const medicationIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    medications.forEach((med, index) => {
      map.set(med.id, index);
    });
    return map;
  }, [medications]);

  // Calculate patient age
  const age = Math.floor(
    (new Date().getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  // Check if any medication has preparations
  const hasPreparations = medications.some(
    med => med.preparationMode !== 'none' &&
      ((med.preparations && med.preparations.length > 0) ||
        (med.optimisedPreparations && med.optimisedPreparations.length > 0))
  );

  // Calculate preparation summaries
  const preparationSummaries = React.useMemo(() => {
    return medications
      .filter(med => med.preparationMode !== 'none')
      .map(med => {
        const doses = calculatedDoses.get(med.id) || [];
        return calculatePreparationSummary(med, doses);
      })
      .filter(summary => summary.requiredPreparations.length > 0);
  }, [medications, calculatedDoses]);

  // Patient header component (appears on every page)
  const PatientHeader = () => (
    <View style={styles.header} fixed>
      <Text style={styles.headerTitle}>VARIABLE DOSE SCHEDULE</Text>
      <View style={styles.patientInfo}>
        <View style={styles.patientColumn}>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.label}>Patient: </Text>
              {patient.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.label}>Date of Birth: </Text>
              {formatDate(patient.dateOfBirth)} (Age: {age})
            </Text>
          </View>
        </View>
        <View style={styles.patientColumn}>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.label}>Address: </Text>
              {patient.address}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.label}>Generated: </Text>
              {formatDate(new Date())}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.medicationsLegend}>
        <Text style={styles.legendTitle}>Medications:</Text>
        <View style={styles.legendGrid}>
          {medications.map((med, index) => (
            <Text key={med.id} style={styles.legendItem}>
              {index + 1}. {med.medicationName} ({getScheduleTypeLabel(med.scheduleType)}) - {getScheduleDescription(med)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );

  // Preparation summary component
  const PreparationSummarySection = () => {
    if (!hasPreparations || preparationSummaries.length === 0) return null;

    return (
      <View style={styles.preparationSummary}>
        <Text style={styles.preparationTitle}>Preparation Requirements (Total for entire course)</Text>
        {preparationSummaries.map((summary, index) => (
          <View key={index}>
            <Text style={[styles.preparationItem, { fontFamily: 'Helvetica-Bold' }]}>
              {summary.medicationName}:
            </Text>
            {summary.requiredPreparations.map((req, i) => (
              <Text key={i} style={styles.preparationItem}>
                • {req.preparation.strength}{req.preparation.unit}: {req.totalQuantity} {req.totalQuantity === 1 ? 'tablet' : 'tablets'}
              </Text>
            ))}
            {summary.warnings.length > 0 && (
              <Text style={[styles.preparationItem, { color: '#DC2626' }]}>
                Warning: {summary.warnings.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render a calendar month
  const renderMonth = (month: Date) => {
    const calendarDays = generateCalendarDays(month, calculatedDoses);
    const weeks: CalendarDay[][] = [];

    // Group days into weeks
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <View key={month.toString()}>
        <Text style={styles.monthTitle}>{format(month, 'MMMM yyyy')}</Text>
        <View style={styles.calendarTable}>
          {/* Day headers */}
          <View style={styles.tableHeader}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day) => (
                <Text key={day} style={styles.dayHeader}>
                  {day}
                </Text>
              )
            )}
          </View>

          {/* Week rows */}
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.tableRow}>
              {week.map((calDay, dayIndex) => {
                const cellStyles = calDay.isCurrentMonth
                  ? styles.dayCell
                  : [styles.dayCell, styles.dayCellOtherMonth];

                const dayNumberStyles = calDay.isCurrentMonth
                  ? styles.dayNumber
                  : [styles.dayNumber, styles.dayNumberOtherMonth];

                return (
                  <View key={dayIndex} style={cellStyles}>
                    <Text style={dayNumberStyles}>{format(calDay.date, 'd')}</Text>
                    {calDay.doses.map((dose) => {
                      const medIndex = medicationIndexMap.get(dose.medicationId) ?? 0;
                      const colors = getMedicationPDFColor(medIndex);

                      // Handle OFF days
                      if (dose.isOffDay) {
                        return (
                          <View
                            key={dose.medicationId}
                            style={[
                              styles.doseEntry,
                              styles.doseEntryOff,
                              {
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Text style={[styles.doseName, { color: colors.text }]}>
                              {dose.medicationName}:
                            </Text>
                            <Text style={styles.doseOff}>OFF</Text>
                          </View>
                        );
                      }

                      // Check if this dose has multiple dose times
                      const hasDoseTimes = dose.doseTimes && dose.doseTimes.length > 0;

                      return (
                        <View
                          key={dose.medicationId}
                          style={[
                            styles.doseEntry,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.doseName, { color: colors.text }]}>
                            {dose.medicationName}:
                          </Text>

                          {hasDoseTimes ? (
                            // Multiple dose times display
                            <>
                              {dose.doseTimes!.map((dt) => (
                                <View key={dt.time} style={styles.doseTimeRow}>
                                  <Text style={[styles.doseTimeLabel, { color: colors.text }]}>
                                    {DOSE_TIME_SHORT_LABELS[dt.time]}:
                                  </Text>
                                  <Text style={[styles.doseTimeValue, { color: colors.text }]}>
                                    {formatDose(dt.dose, dose.unit)}
                                  </Text>
                                </View>
                              ))}
                              {dose.doseTimes!.length > 1 && (
                                <View style={styles.doseTotalRow}>
                                  <Text style={styles.doseTotalLabel}>Total:</Text>
                                  <Text style={[styles.doseTotalValue, { color: colors.text }]}>
                                    {formatDose(dose.dose, dose.unit)}
                                  </Text>
                                </View>
                              )}
                              {/* Show tablet breakdown for each dose time if available */}
                              {hasPreparations && dose.doseTimes!.some(dt => dt.tabletBreakdown && dt.tabletBreakdown.length > 0) && (
                                <>
                                  {dose.doseTimes!.map((dt) => (
                                    dt.tabletBreakdown && dt.tabletBreakdown.length > 0 && (
                                      <Text key={`${dt.time}-breakdown`} style={styles.tabletBreakdown}>
                                        {DOSE_TIME_SHORT_LABELS[dt.time]}: {formatTabletBreakdownPDF(dt.tabletBreakdown)}
                                      </Text>
                                    )
                                  ))}
                                </>
                              )}
                            </>
                          ) : (
                            // Single dose display (original behavior)
                            <>
                              <Text style={[styles.doseAmount, { color: colors.text }]}>
                                {formatDose(dose.dose, dose.unit)}
                              </Text>
                              {hasPreparations && dose.tabletBreakdown && dose.tabletBreakdown.length > 0 && (
                                <Text style={styles.tabletBreakdown}>
                                  ({formatTabletBreakdownPDF(dose.tabletBreakdown)})
                                </Text>
                              )}
                            </>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Document>
      {months.map((month, monthIndex) => (
        <Page key={monthIndex} size="A4" orientation="landscape" style={styles.page}>
          <PatientHeader />
          {renderMonth(month)}
          {/* Show preparation summary on first page */}
          {monthIndex === 0 && <PreparationSummarySection />}
          <View style={styles.footer} fixed>
            <Text>
              This medication schedule was generated on {formatDate(new Date())} and should be
              reviewed with a healthcare professional. Always follow your doctor's instructions and
              report any side effects or concerns.
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};
