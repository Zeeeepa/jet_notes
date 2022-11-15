Add Duplicate Rules settings in DO Object Builder
- Display duplicate rules list
- Option to add / edit rule
- Option to delete rule
- All existing DO fields should be available for setting a rule
- Can have multiple fields for validation
- Enforce validation for at least one field created
- Enforce validation for unique field names when creating a field

Validate fields if duplicate DO exists based on rules
- Upon editing a field, check if its part of a rule and if duplicate check should trigger for that rule (all related fields should have values) 
- Rules with 1 or more empty field values should not trigger duplicate check
- If duplicates exists, disable saving and display a button that will show a popup with all duplicate DO display fields and inputs to edit related fields for each item
- If duplicates exists, show all duplicate DOs and display fields details
- If duplicates doesn't exist, DO should save successfully