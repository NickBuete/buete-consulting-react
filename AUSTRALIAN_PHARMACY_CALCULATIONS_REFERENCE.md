# Australian Pharmacy Calculations & Tools Reference

> **Purpose**: Comprehensive reference guide for implementing pharmacy calculation tools and clinical decision support features tailored for Australian pharmacy practice.

## Table of Contents

1. [Core Pharmacy Calculations](#core-pharmacy-calculations)
2. [Renal Function & Dosing](#renal-function--dosing)
3. [Opioid Conversions](#opioid-conversions)
4. [Unit Conversions](#unit-conversions)
5. [Pediatric Calculations](#pediatric-calculations)
6. [Infusion & IV Calculations](#infusion--iv-calculations)
7. [Compounding Calculations](#compounding-calculations)
8. [TPN Calculations](#tpn-calculations)
9. [Immunization Tools](#immunization-tools)
10. [Australian-Specific Requirements](#australian-specific-requirements)
11. [Quick Reference Resources](#quick-reference-resources)
12. [Implementation Notes](#implementation-notes)

---

## Core Pharmacy Calculations

### 1. Basic Dose Calculations

#### Weight-Based Dosing
```
Dose (mg) = Weight (kg) × Dose per kg (mg/kg)
```

**Example**: Gentamicin 5mg/kg for an 80kg patient
```
Dose = 80 kg × 5 mg/kg = 400 mg
```

**Common Australian weight-based dosing:**
- Gentamicin: 4-7 mg/kg (extended interval)
- Vancomycin: 25-30 mg/kg loading dose
- Paracetamol (pediatric): 15 mg/kg per dose
- Ibuprofen (pediatric): 10 mg/kg per dose
- Amoxicillin (pediatric): 25-50 mg/kg/day divided

#### Body Surface Area (BSA) Based Dosing

**Mosteller Formula** (most commonly used):
```
BSA (m²) = √[(Height in cm × Weight in kg) / 3600]
```

**DuBois Formula** (alternative):
```
BSA (m²) = 0.007184 × Height(cm)^0.725 × Weight(kg)^0.425
```

**Example**: Calculate BSA for 170cm, 70kg adult
```
BSA = √[(170 × 70) / 3600] = √3.306 = 1.82 m²
```

**Common chemotherapy dosing:**
- Carboplatin: AUC-based (see renal section)
- Doxorubicin: 60-75 mg/m² per cycle
- Cyclophosphamide: 500-1000 mg/m² per cycle

#### Dilution Calculations

**C1V1 = C2V2**

Where:
- C1 = initial concentration
- V1 = initial volume
- C2 = final concentration
- V2 = final volume

**Example**: Dilute 10 mL of 100 mg/mL solution to 50 mg/mL
```
100 mg/mL × 10 mL = 50 mg/mL × V2
V2 = 20 mL (total volume, so add 10 mL diluent)
```

### 2. Percentage Strength Conversions

**Weight/Volume (w/v)**:
```
% w/v = (grams of solute / 100 mL of solution) × 100
mg/mL = % w/v × 10
```

**Example**: 5% dextrose = 5g/100mL = 50 mg/mL

**Volume/Volume (v/v)**:
```
% v/v = (mL of solute / 100 mL of solution) × 100
```

**Example**: 70% ethanol = 70 mL ethanol per 100 mL solution

**Common concentrations in Australian practice:**
- Normal Saline: 0.9% w/v = 9 mg/mL NaCl
- Lignocaine 1%: 10 mg/mL
- Adrenaline 1:1000 = 0.1% = 1 mg/mL
- Adrenaline 1:10,000 = 0.01% = 0.1 mg/mL

### 3. Ratio Strength

```
1:X means 1 gram in X mL
```

**Conversion**:
```
1:1000 = 1g/1000mL = 1000mg/1000mL = 1 mg/mL
```

**Examples:**
- Adrenaline 1:1000 = 1 mg/mL
- Adrenaline 1:10,000 = 0.1 mg/mL
- Chlorhexidine 1:2000 = 0.5 mg/mL

---

## Renal Function & Dosing

### 1. Creatinine Clearance (Cockcroft-Gault)

**Formula**:
```
CrCl (mL/min) = [(140 - age) × weight (kg) × constant] / [SCr (μmol/L)]
```

Where constant is:
- **Male**: 1.23
- **Female**: 1.04

**Alternative (SCr in mg/dL)**:
```
CrCl (mL/min) = [(140 - age) × weight (kg)] / [72 × SCr (mg/dL)]
× 0.85 (if female)
```

**Conversion**: μmol/L ÷ 88.4 = mg/dL

**Example**: 65-year-old male, 80kg, SCr 120 μmol/L
```
CrCl = [(140 - 65) × 80 × 1.23] / 120 = 61.5 mL/min
```

**Clinical Interpretation:**
- **Normal**: 90-120 mL/min
- **Mild impairment**: 60-89 mL/min
- **Moderate impairment**: 30-59 mL/min
- **Severe impairment**: 15-29 mL/min
- **Kidney failure**: <15 mL/min

### 2. eGFR (CKD-EPI)

**Used for**: CKD staging (more accurate than Cockcroft-Gault for GFR estimation)

The CKD-EPI equation is complex and typically calculated via online calculators. Key differences from Cockcroft-Gault:
- eGFR is normalized to 1.73 m² BSA
- More accurate for higher GFR values
- Does not require weight

**CKD Stages:**
- **Stage 1**: eGFR ≥90 (normal, with other kidney damage)
- **Stage 2**: eGFR 60-89 (mild reduction)
- **Stage 3a**: eGFR 45-59 (mild-moderate reduction)
- **Stage 3b**: eGFR 30-44 (moderate-severe reduction)
- **Stage 4**: eGFR 15-29 (severe reduction)
- **Stage 5**: eGFR <15 (kidney failure)

**Australian Practice Note**: AMH and PBS dosing recommendations often reference CrCl (Cockcroft-Gault) rather than eGFR.

### 3. Carboplatin Dosing (Calvert Formula)

```
Dose (mg) = Target AUC × (GFR + 25)
```

**Common AUC targets:**
- Single agent: AUC 5-7
- Combination: AUC 4-6

**Example**: Target AUC 5, GFR 60 mL/min
```
Dose = 5 × (60 + 25) = 425 mg
```

**Maximum GFR cap**: Usually 125 mL/min to avoid overdosing

### 4. Aminoglycoside Dosing

**Extended Interval (Hartford) Nomogram**:
- **Gentamicin/Tobramycin**: 5-7 mg/kg IV once daily
- **Amikacin**: 15-20 mg/kg IV once daily

**Monitoring**:
- Random level 6-14 hours post-dose
- Use nomogram for interval adjustment

**Traditional Dosing** (rarely used):
- Gentamicin: 1-1.7 mg/kg every 8 hours
- Target trough <1 mg/L

### 5. Vancomycin Dosing

**Loading Dose**:
```
Loading = 25-30 mg/kg (actual body weight)
```

**Maintenance**:
```
15-20 mg/kg every 8-12 hours
```

**Target Levels**:
- Trough: 10-20 mg/L (indication dependent)
- AUC/MIC: 400-600 (emerging standard)

**Renal Adjustment**:
- CrCl 40-60: Q12-24H
- CrCl 20-40: Q24-48H
- CrCl <20: Load then individualize

---

## Opioid Conversions

### 1. Oral Morphine Milligram Equivalents (MME)

**Conversion Factors to Oral Morphine:**

| Opioid | Route | Conversion Factor |
|--------|-------|-------------------|
| Morphine | Oral | 1 |
| Morphine | Parenteral | 3 |
| Oxycodone | Oral | 1.5 |
| Oxycodone | Parenteral | 2-3 |
| Hydromorphone | Oral | 4 |
| Hydromorphone | Parenteral | 10-15 |
| Fentanyl | Patch (microgram/hr) | 2.4 (per microgram/hr) |
| Fentanyl | Parenteral (microgram) | 0.1 (per microgram) |
| Tramadol | Oral | 0.1 |
| Codeine | Oral | 0.15 |
| Tapentadol | Oral | 0.3-0.4 |
| Buprenorphine | Patch (microgram/hr) | 12.6 (per microgram/hr) |
| Methadone | Oral | Variable (1-20)* |

*Methadone conversion is complex and dose-dependent. Specialist consultation recommended.

**Formula**:
```
MME = Daily dose of opioid × Conversion factor
```

**Example 1**: Oxycodone 20mg BD (40mg/day total)
```
MME = 40 mg × 1.5 = 60 mg oral morphine equivalents per day
```

**Example 2**: Fentanyl patch 25 microgram/hr
```
MME = 25 microgram/hr × 2.4 = 60 mg oral morphine equivalents per day
```

**Example 3**: Morphine 10mg PO TDS + Endone 10mg PO PRN (taken 4 times)
```
Morphine: 30 mg × 1 = 30 MME
Oxycodone: 40 mg × 1.5 = 60 MME
Total: 90 MME per day
```

### 2. Opioid Rotation

**Apply 25-50% dose reduction when switching** (cross-tolerance)

**Example**: Convert Oxycodone 20mg BD to oral Morphine
```
Step 1: Calculate MME = 40 mg × 1.5 = 60 MME
Step 2: Apply 25% reduction = 60 × 0.75 = 45 mg morphine per day
Step 3: Divide into doses = 15 mg TDS or 22.5 mg BD
```

**Clinical Considerations:**
- More cautious reduction (50%) in frail/elderly
- Less reduction if inadequate pain control
- Consider breakthrough doses (10-15% of total daily dose)

### 3. Transdermal Fentanyl Conversion

**Approximate Equivalent Daily Doses:**

| Oral Morphine (mg/day) | Fentanyl Patch (microgram/hr) |
|------------------------|-------------------------------|
| 30-60 | 12 |
| 60-90 | 25 |
| 90-150 | 50 |
| 150-210 | 75 |
| 210-270 | 100 |

**Key Points:**
- Patches changed every 72 hours
- 12-24 hours to reach steady state
- Continue regular opioids for first 12 hours after applying
- Breakthrough dose: Morphine 1/6 of daily dose or Oxycodone 1/10 of daily dose

---

## Unit Conversions

### 1. Weight Conversions

```
1 kg = 1000 g = 1,000,000 mg = 1,000,000,000 micrograms = 1,000,000,000,000 nanograms
1 g = 1000 mg
1 mg = 1000 micrograms
1 microgram = 1000 nanograms
```

**Australian Terminology**: Always write "microgram" in full (not "mcg" or "μg") to avoid medication errors. Similarly, write "unit" in full (not "U").

### 2. Volume Conversions

```
1 L = 1000 mL
1 mL = 1 cc (cubic centimeter)
1 teaspoon = 5 mL
1 tablespoon = 15 mL (Australian standard)
```

**Note**: Some international resources use 20 mL for tablespoon. In Australian practice, use 15 mL.

**Oral dosing devices (Australian standard):**
- Medicine cups marked in mL
- Oral syringes in mL (not teaspoons)

### 3. Temperature Conversions

```
°C to °F: (°C × 9/5) + 32
°F to °C: (°F - 32) × 5/9
```

**Key temperatures:**
- Room temperature: 15-25°C
- Refrigerator: 2-8°C
- Freezer: -15 to -25°C
- Body temperature: 37°C (98.6°F)

### 4. Pressure Conversions

```
1 mmHg = 0.133 kPa
1 kPa = 7.5 mmHg
```

**Australian Practice**: Blood pressure typically reported in mmHg

### 5. Units & International Units

- **Insulin**: Measured in units (U)
- **Heparin**: Units or IU
- **Vitamins**: IU or microgram
- **Penicillin**: Units or mg

**Important**: Always use "units" spelled out, never "U" (error-prone)

---

## Pediatric Calculations

### 1. Age-Based Weight Estimation

**Infant (0-12 months)**:
```
Weight (kg) = (Age in months × 0.5) + 4
```

**Child (1-10 years)**:
```
Weight (kg) = (Age in years × 2) + 8
```

**Example**: 5-year-old child
```
Weight = (5 × 2) + 8 = 18 kg
```

### 2. Pediatric Drug Dosing

**Paracetamol (oral)**:
```
Dose = 15 mg/kg per dose (max 1g per dose)
Frequency = Every 4-6 hours (max 4 doses/24hr)
Maximum daily dose = 60 mg/kg/day or 4g/day (whichever is lower)
```

**Example**: 20kg child
```
Dose = 20 kg × 15 mg/kg = 300 mg per dose
Maximum daily = 20 kg × 60 mg/kg = 1200 mg/day
```

**Ibuprofen (oral)**:
```
Dose = 10 mg/kg per dose (max 400mg per dose)
Frequency = Every 6-8 hours (max 3 doses/24hr)
Maximum daily dose = 30 mg/kg/day or 1200mg/day
```

**Amoxicillin**:
```
Standard dose: 25-50 mg/kg/day divided BD or TDS
Severe infections: Up to 100 mg/kg/day
```

**Example**: 15kg child, moderate infection
```
Daily dose = 15 kg × 40 mg/kg = 600 mg/day
Divided TDS = 200 mg TDS
```

### 3. Pediatric Fluid Requirements

**Holliday-Segar Method**:
- First 10 kg: 100 mL/kg/day
- Next 10 kg: 50 mL/kg/day
- Each kg over 20 kg: 20 mL/kg/day

**Example**: 25 kg child
```
First 10 kg: 10 × 100 = 1000 mL
Next 10 kg: 10 × 50 = 500 mL
Remaining 5 kg: 5 × 20 = 100 mL
Total = 1600 mL/day = 66.7 mL/hr
```

### 4. Immunization Age Guidelines (Australian Schedule)

**Birth**: Hepatitis B
**2 months**: 6-in-1 (DTaP-Hib-HepB-IPV), PCV, Rotavirus
**4 months**: 6-in-1, PCV, Rotavirus
**6 months**: 6-in-1, PCV, Hepatitis B (if not given at birth)
**12 months**: MMR, Meningococcal ACWY, PCV
**18 months**: 6-in-1, MMR, Varicella
**4 years**: DTaP-IPV
**10-15 years**: HPV (school program)
**14-16 years**: dTpa booster, Meningococcal B

---

## Infusion & IV Calculations

### 1. Basic Infusion Rate

**Formula**:
```
Rate (mL/hr) = Volume (mL) / Time (hours)
```

**Example**: Infuse 1000 mL over 8 hours
```
Rate = 1000 mL / 8 hr = 125 mL/hr
```

### 2. Drops Per Minute

**Formula**:
```
Drops/min = (Volume in mL × Drop factor) / Time in minutes
```

**Australian Drop Factors:**
- Standard giving set: 20 drops/mL
- Paediatric/blood set: 60 drops/mL (microdrip)

**Example**: 1000 mL over 8 hours, standard set
```
Drops/min = (1000 × 20) / 480 = 41.7 ≈ 42 drops/min
```

### 3. Drug Concentration for Infusion

**Formula**:
```
Concentration (mg/mL) = Total drug (mg) / Total volume (mL)
```

**Example**: Dopamine 400mg in 250mL
```
Concentration = 400 mg / 250 mL = 1.6 mg/mL
```

### 4. Dose Rate Calculations

**microgram/kg/min to mL/hr**:
```
Rate (mL/hr) = [Dose (microgram/kg/min) × Weight (kg) × 60] / Concentration (microgram/mL)
```

**Example**: Dobutamine 5 microgram/kg/min, patient 80kg, concentration 1000 microgram/mL
```
Rate = (5 × 80 × 60) / 1000 = 24 mL/hr
```

### 5. Common Infusion Concentrations (Australian ICU)

**Noradrenaline**: 40 microgram/mL (4mg in 100mL)
**Adrenaline**: 40 microgram/mL (4mg in 100mL)
**Dopamine**: 1600 microgram/mL (400mg in 250mL)
**Dobutamine**: 1000 microgram/mL (250mg in 250mL)
**Amiodarone**: 1.8 mg/mL (450mg in 250mL)
**Insulin**: 1 unit/mL (50 units in 50mL)

### 6. Heparin Infusion

**Loading Dose**: 80 units/kg IV bolus (max 10,000 units)
**Maintenance**: 18 units/kg/hr

**Example**: 70kg patient
```
Loading = 70 × 80 = 5,600 units
Maintenance = 70 × 18 = 1,260 units/hr
```

If concentration is 25,000 units in 500 mL (50 units/mL):
```
Rate = 1,260 units/hr ÷ 50 units/mL = 25.2 mL/hr
```

---

## Compounding Calculations

### 1. Percentage Strength Adjustments

**Mixing two strengths to get intermediate strength**:

**Alligation Method**:
```
Use parts of higher and lower strength to achieve desired strength
```

**Example**: Make 100g of 5% cream using 10% and 2.5% creams
```
        10% (higher)
           \
            5% (desired)
           /
        2.5% (lower)

Parts of 10%: (5 - 2.5) = 2.5 parts
Parts of 2.5%: (10 - 5) = 5 parts
Total = 7.5 parts

Amount of 10% = (2.5/7.5) × 100g = 33.3g
Amount of 2.5% = (5/7.5) × 100g = 66.7g
```

### 2. Dilution of Stock Solutions

**Example**: Make 500mL of 0.05% chlorhexidine from 4% stock
```
C1V1 = C2V2
4% × V1 = 0.05% × 500 mL
V1 = 6.25 mL of 4% stock
Add water to 500 mL
```

## TPN Calculations

### 1. Energy Requirements

**Harris-Benedict Equation** (Basal Energy Expenditure):

**Male**:
```
BEE = 66 + (13.7 × weight in kg) + (5 × height in cm) - (6.8 × age)
```

**Female**:
```
BEE = 655 + (9.6 × weight in kg) + (1.8 × height in cm) - (4.7 × age)
```

**Total Energy Expenditure**:
```
TEE = BEE × Activity Factor × Stress Factor
```

**Activity Factor**: 1.2 (bedbound) to 1.3 (mobile)
**Stress Factor**: 1.0-1.5 (illness dependent)

### 2. Protein Requirements

```
Standard: 1.0-1.5 g/kg/day
Critical illness: 1.5-2.0 g/kg/day
Renal impairment (without dialysis): 0.6-0.8 g/kg/day
```

### 3. Macronutrient Calculations

**Dextrose**:
```
Energy = 3.4 kcal/g (or 16.7 kJ/g)
```

**Lipid**:
```
Energy = 9 kcal/g (or 37.6 kJ/g)
```

**Protein (amino acids)**:
```
Energy = 4 kcal/g (not usually counted in non-protein calories)
```

**Example**: 70kg patient requires 2000 kcal/day (non-protein)
- 50% from dextrose: 1000 kcal ÷ 3.4 = 294g dextrose
- 50% from lipid: 1000 kcal ÷ 9 = 111g lipid

### 4. Electrolytes in TPN

**Daily requirements:**
- Sodium: 1-2 mmol/kg
- Potassium: 1-2 mmol/kg
- Calcium: 0.1-0.2 mmol/kg
- Magnesium: 0.1-0.2 mmol/kg
- Phosphate: 0.3-0.6 mmol/kg

---

## Immunization Tools

### 2. Catch-Up Schedules

**Reference**: Australian Immunisation Handbook

**Minimum intervals** (most vaccines):
- Between doses: 4 weeks
- For live vaccines: 4 weeks apart or same day

**Accelerated HepB schedule**:
- 0, 1, 2, 12 months (standard: 0, 1-2, 6 months)

### 3. Travel Vaccine Timing

**Yellow Fever**: Valid 10 days after administration
**Japanese Encephalitis**: 2 dose course (0, 28 days)
**Rabies**: 3 doses (0, 7, 21-28 days)
**Typhoid**: Single dose, 2-3 weeks before travel

### 4. Anaphylaxis Management

**Adrenaline (1:1000, 1mg/mL) IM doses:**
- Adult: 0.5 mL (500 microgram)
- Child >12 years: 0.5 mL (500 microgram)
- Child 6-12 years: 0.3 mL (300 microgram)
- Child 3-6 years: 0.15 mL (150 microgram)
- Infant <3 years: 0.1 mL (100 microgram)

**Repeat every 5 minutes if needed**

---

## Australian-Specific Requirements

### 4. Medication Dosing in AMH (Australian Medicines Handbook)

**Standard references:**
- AMH provides Australian-specific dosing
- Often differs from international guidelines
- Includes PBS restrictions
- Adjusted for renal/hepatic impairment


## Quick Reference Resources

### Australian Regulatory Bodies

1. **Therapeutic Goods Administration (TGA)**
   - Website: https://www.tga.gov.au
   - Medicine approvals, safety alerts, ARTG

2. **Pharmaceutical Benefits Scheme (PBS)**
   - Website: https://www.pbs.gov.au
   - Pricing, restrictions, authority requirements

3. **Australian Medicines Handbook (AMH)**
   - Subscription: https://amhonline.amh.net.au
   - Primary dosing reference in Australia

4. **National Prescribing Service (NPS MedicineWise)**
   - Website: https://www.nps.org.au
   - Education, clinical guidelines

5. **Australian Immunisation Handbook**
   - Website: https://immunisationhandbook.health.gov.au
   - Free, comprehensive vaccine guide

### State-Based Systems

**Victoria**:
- SafeScript: https://www.safescript.vic.gov.au
- Department of Health: https://www.health.vic.gov.au

**NSW**:
- SafeScript NSW: https://www.safescript.health.nsw.gov.au
- Ministry of Health: https://www.health.nsw.gov.au

**Queensland**:
- QScript: Contact QLD Health
- Health Department: https://www.health.qld.gov.au

**WA**:
- RTPM: https://www.health.wa.gov.au

**SA**:
- Medicines Handbook: SA Health website

**Tasmania**:
- DAPIS: https://www.dhhs.tas.gov.au

### Professional Organizations

1. **Pharmaceutical Society of Australia (PSA)**
   - Website: https://www.psa.org.au
   - CPD, resources, professional standards

2. **Society of Hospital Pharmacists of Australia (SHPA)**
   - Website: https://www.shpa.org.au
   - Clinical guidelines, standards

3. **QCPP (Quality Care Pharmacy Program)**
   - Website: https://www.qcpp.com
   - Quality standards, accreditation

### Clinical Tools & Calculators

1. **GlobalRPh** - Drug dosing calculators
2. **Medscape** - Drug interaction checker
3. **Micromedex** - Evidence-based drug information
4. **Lexicomp** - Drug information
5. **UpToDate** - Clinical decision support

### Emergency References

1. **Australian Injectable Drugs Handbook (AIDH)**
   - Compatibility, dilution, administration

2. **Therapeutic Guidelines**
   - Antibiotic, cardiovascular, palliative care
   - Subscription-based

3. **TOXBASE** (NSW only) / Poisons Information: **13 11 26**

## Implementation Notes

### Technology Considerations

When implementing these calculations as digital tools:

1. **Input Validation**
   - Range checking (e.g., age 0-120, weight 0-300kg)
   - Unit awareness (automatic conversion)
   - Mandatory fields vs optional

2. **Safety Features**
   - Dosing alerts for extremes
   - Renal adjustment warnings
   - Drug interaction flags
   - Pregnancy category display

3. **User Experience**
   - Default to Australian units (kg, mL, °C, mmol/L)
   - Provide both μmol/L and mg/dL for creatinine
   - Show formulas and references
   - Allow printing/saving results

4. **Regulatory Compliance**
   - Disclaimer: "For reference only, clinical judgment required"
   - Not a substitute for clinical assessment
   - Regular updates with guideline changes

5. **Accessibility**
   - Mobile-responsive design
   - Clear labels and instructions
   - Error messages that guide users

### Testing & Validation

All calculations should be:
- Cross-checked with multiple references
- Tested with edge cases
- Validated against known examples
- Reviewed by practicing pharmacists

### Data Sources

Use authoritative Australian sources:
- AMH for dosing
- PBS for subsidy information
- TGA for safety information
- Australian Immunisation Handbook for vaccines
- State health departments for jurisdictional requirements

### Update Schedule

This reference should be reviewed:
- Annually for general content
- Immediately for safety-critical changes (TGA alerts)
- PBS changes (typically Feb, Jul, Nov)
- Schedule changes (usually Feb, Jun, Oct)

---

## Future Feature Ideas

### Advanced Calculators

1. **Warfarin Dosing Assistant**
   - INR tracking
   - Dose adjustments
   - Interaction checker

2. **Chemotherapy Dose Verification**
   - BSA calculation
   - Dose banding
   - Cycle tracking

3. **Diabetes Management**
   - Insulin dose calculator
   - Carb counting
   - HbA1c converter (% to mmol/mol)

4. **Anticoagulation**
   - CHA₂DS₂-VASc score
   - HAS-BLED score
   - NOAC dosing guide

5. **Critical Care**
   - Sedation scoring
   - Nutrition requirements
   - Fluid balance

### Clinical Decision Support

1. **Drug Interaction Checker**
   - Australian product database
   - Severity ratings
   - Management suggestions

2. **Renal Dosing Database**
   - CrCl/eGFR-based recommendations
   - Dialysis dosing
   - Drug accumulation warnings

3. **Pregnancy/Lactation Categories**
   - Australian categories
   - Risk assessment
   - Alternatives

4. **Immunisation Schedule**
   - Age-based reminders
   - Catch-up calculator
   - Travel vaccines

### Compliance Tools

1. **MedsCheck Documentation**
   - Template generation
   - PBS item numbers
   - Claiming guide

2. **Staged Supply Tracking**
   - Schedule of installments
   - Compliance monitoring
   - Documentation

3. **PBS Authority Codes**
   - Quick reference
   - Criteria checklist
   - Phone/online links

### Education & Training

1. **Practice Scenarios**
   - Case studies
   - Calculation practice
   - Decision trees

2. **CPD Tracking**
   - PSA CPD requirements
   - Certificate generation
   - Reflection prompts

3. **Reference Library**
   - Quick links to guidelines
   - Bookmark favorite resources
   - Update notifications

---

## Version History

**Version 1.0** - December 2024
- Initial comprehensive reference created
- Core calculations documented
- Australian-specific requirements added
- Implementation notes included

---

## Contributors & Acknowledgments

This reference guide is intended for implementation in Australian pharmacy practice software. It should be reviewed by practicing pharmacists and updated regularly to reflect current guidelines and regulations.

**Key References:**
- Australian Medicines Handbook (AMH)
- Therapeutic Guidelines
- Australian Injectable Drugs Handbook (AIDH)
- PBS Online
- TGA Guidelines
- Australian Immunisation Handbook
- State Health Department Guidelines

---

## Disclaimer

This document is provided for reference purposes only. All clinical calculations and decisions should be made by qualified healthcare professionals using their clinical judgment. Always verify dosing against current authoritative sources and consider patient-specific factors. This document does not replace professional judgment or consultation with specialists when needed.

---

*Last Updated: December 2024*
*Next Review Due: December 2025*
