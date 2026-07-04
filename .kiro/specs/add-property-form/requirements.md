# Requirements Document

## Introduction

The Add a Property form is a full-page form view within the RentHub Landlord Studio application that replaces the existing modal-based property creation flow. When a landlord clicks "+ Add property" from the Properties tab of the OwnerDashboard, they are presented with a structured, two-column form to enter the property's general information, insurance details, property type, and physical features. On successful submission, the new property is persisted to Firebase and the landlord is returned to the Properties tab with the new property visible.

## Glossary

- **AddPropertyForm**: The full-page form component that collects property details from the landlord.
- **OwnerDashboard**: The existing React component that hosts the landlord's studio interface, including the Properties tab.
- **PropertyListing**: The TypeScript interface representing a property record stored in Firebase.
- **GeneralInformation**: The left-column section of the form collecting address fields.
- **Insurance**: The right-column section of the form collecting insurance provider, premium, and renewal date.
- **PropertyType**: A mutually exclusive selection between "Single Family Home" and "Multi-unit".
- **Features**: The section collecting numeric attributes — total area, bedrooms, and bathrooms.
- **Landlord**: The authenticated user with the "owner" role operating within OwnerDashboard.
- **Firebase**: The backend data store used by the application via the existing `onCreateListing` callback.

---

## Requirements

### Requirement 1: Navigate to the Add Property Form

**User Story:** As a Landlord, I want to open a full-page Add a Property form, so that I can enter detailed property information without being constrained by a modal overlay.

#### Acceptance Criteria

1. WHEN the Landlord clicks the "+ Add property" button on the Properties tab, THE OwnerDashboard SHALL replace the Properties tab view with the AddPropertyForm full-page view.
2. THE AddPropertyForm SHALL display the page title "Add a property" and the subtitle "Get started by adding your property's address and details below."
3. THE AddPropertyForm SHALL display a "Save" button in the top-right area of the form header.
4. WHEN the AddPropertyForm is displayed, THE OwnerDashboard SHALL NOT render the Properties list or filter tabs underneath it.

---

### Requirement 2: General Information Section

**User Story:** As a Landlord, I want to enter the property's address details in a dedicated section, so that the property location is accurately recorded.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL display a "GENERAL INFORMATION" section in the left column containing the following text input fields: Property address, Address line 2, Suburb, City, State / Province, ZIP / Postcode, and Country.
2. THE AddPropertyForm SHALL display the placeholder text "212 Kent Road" in the Property address field.
3. WHEN the Landlord submits the form without entering a value in the Property address field, THE AddPropertyForm SHALL display a validation error indicating the Property address is required.
4. WHEN the Landlord submits the form, THE AddPropertyForm SHALL accept Address line 2, Suburb, City, State / Province, ZIP / Postcode, and Country as optional fields.

---

### Requirement 3: Insurance Section

**User Story:** As a Landlord, I want to record the property's insurance details alongside the address, so that I can track coverage and renewal dates from a single form.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL display an "INSURANCE" section in the right column containing: a "Current insurance provider" text input, an "Annual premium" USD currency input, and a "Renewal date" date picker.
2. THE AddPropertyForm SHALL display the placeholder text "Enter insurance provider" in the Current insurance provider field.
3. THE AddPropertyForm SHALL pre-populate the Annual premium field with the default value 1,000.00.
4. THE AddPropertyForm SHALL display the Renewal date picker accepting input in DD MMMM YYYY format.
5. WHEN the Landlord submits the form, THE AddPropertyForm SHALL accept all Insurance section fields as optional.

---

### Requirement 4: Property Type Selection

**User Story:** As a Landlord, I want to select the property type using clearly labelled radio cards, so that the system correctly classifies the property for leasing and reporting purposes.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL display a "PROPERTY TYPE" section with two mutually exclusive radio card options: "Single Family Home" and "Multi-unit".
2. THE AddPropertyForm SHALL display the description "A single family home is a standalone property like a town house with only one lease." beneath the Single Family Home radio card.
3. THE AddPropertyForm SHALL display the description "A multi-unit or HMO is a single building with multiple units and leases such as a duplex or apartment block." beneath the Multi-unit radio card.
4. THE AddPropertyForm SHALL pre-select the "Single Family Home" option as the default.
5. WHEN the Landlord selects a radio card option, THE AddPropertyForm SHALL highlight the selected card in blue and deselect the previously selected card.
6. WHEN the Landlord submits the form without selecting a property type, THE AddPropertyForm SHALL display a validation error indicating a property type selection is required.

---

### Requirement 5: Features Section

**User Story:** As a Landlord, I want to enter the physical characteristics of the property, so that prospective tenants and internal reports reflect accurate property details.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL display a "FEATURES" section with the following numeric input fields: Total area (m²), Bedrooms, and Bathrooms.
2. THE AddPropertyForm SHALL display the placeholder value 0.00 in the Total area field.
3. THE AddPropertyForm SHALL display the placeholder value 0.0 in the Bedrooms field.
4. THE AddPropertyForm SHALL display the placeholder value 0.0 in the Bathrooms field.
5. WHEN the Landlord enters a value less than 0 in any Features numeric field, THE AddPropertyForm SHALL display a validation error indicating the value must be zero or greater.
6. WHEN the Landlord submits the form, THE AddPropertyForm SHALL accept all Features fields as optional, treating empty fields as zero.

---

### Requirement 6: Form Submission and Persistence

**User Story:** As a Landlord, I want submitted property data to be saved to the backend, so that the new property appears in my Properties list immediately after saving.

#### Acceptance Criteria

1. WHEN the Landlord clicks the "Save" button and the form passes validation, THE AddPropertyForm SHALL invoke the existing `onCreateListing` callback with the collected form data mapped to the `PropertyListing` structure.
2. WHEN the `onCreateListing` callback resolves successfully, THE OwnerDashboard SHALL navigate back to the Properties tab and display the newly created property in the properties list.
3. WHEN the `onCreateListing` callback rejects, THE AddPropertyForm SHALL display an error message informing the Landlord that the save failed and prompting them to try again.
4. WHILE the `onCreateListing` callback is pending, THE AddPropertyForm SHALL disable the "Save" button to prevent duplicate submissions.
5. THE AddPropertyForm SHALL map the selected PropertyType radio card value to the existing `PropertyListing.type` field as follows: "Single Family Home" maps to `"house"` and "Multi-unit" maps to `"apartment"`.

---

### Requirement 7: Cancel and Navigation

**User Story:** As a Landlord, I want to leave the Add a Property form without saving, so that I can return to the Properties list if I change my mind.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL provide a way for the Landlord to exit the form without saving, returning to the Properties tab view.
2. WHEN the Landlord exits the form without saving, THE AddPropertyForm SHALL discard all entered data and reset the form fields to their default values.
3. WHEN the Landlord exits the form without saving, THE OwnerDashboard SHALL render the Properties tab in the same state as before the AddPropertyForm was opened.

---

### Requirement 8: Two-Column Responsive Layout

**User Story:** As a Landlord, I want the form to display in a clear two-column layout on wider screens, so that General Information and Insurance details are visible side by side without excessive scrolling.

#### Acceptance Criteria

1. THE AddPropertyForm SHALL render the GeneralInformation section and the Insurance section in a two-column side-by-side layout on screens with a width of 768px or greater.
2. WHILE the viewport width is less than 768px, THE AddPropertyForm SHALL stack the GeneralInformation section and Insurance section into a single column.
3. THE AddPropertyForm SHALL render the PropertyType section and the Features section below the two-column section, spanning the full width of the form.

---

### Requirement 9: Properties Page Empty State

**User Story:** As a Landlord with no properties added yet, I want to see a clear empty state on the Properties tab, so that I understand how to add my first property.

#### Acceptance Criteria

1. WHILE the Landlord has no properties in their portfolio, THE OwnerDashboard SHALL display an empty state illustration and the message "You haven't added any properties yet. Start by clicking + Add Property to add your first one!" on the Properties tab.
2. THE OwnerDashboard SHALL display filter tabs labelled "All", "Rent overdue", "Rent due soon", "Rent due later", "Vacant", and "Multi-Unit" on the Properties tab regardless of whether properties exist.
3. THE OwnerDashboard SHALL display the count of properties matching each filter tab label in parentheses next to the tab name.
