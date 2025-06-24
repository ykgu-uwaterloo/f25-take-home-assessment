### 1. Completed implementation of basic Frontend and Backend usage

### 2. Added more info onto the result of the lookup tab:

1. Now only shows most important info(interpreted for everyone normal day use)
2. Have a show advanced info button for the rest of the info

### 3. Made UI/UX changes to the website to make it look better and modern

1. Auto-copy to lookup field on submit Weather ID
2. Now shows a small weather icon beside the weather description
3. Added animations to lookup tab to make it smoother
4. Disable lookup button unless Weather ID is filled
5. Added a checkmark to make the website be more professional
6. Added a small loading circle when submitting
7. Added a click to copy feature that copies Weather ID either when pressing the copy button, or clicking the Weather ID field directly

### 4. Made validation for Frontend and Backend fields

1. Now validates Date and Location in real time, before submitting, and shows red border and what is wrong if invalid (Could only preform basic location validation because I do not have an api that can verify all valid locations)
2. Disable submit button unless both Date and Location is filled and validated.
3. Changed the Backend date field in weather request to type date to be better validated, as frontend already uses formatForApi() to make sure the date is in correct format
4. Also added validations for Date and Location in backend

### 5. One bonus feature

1. My current free Weatherstack plan only allows for current weather request, so added optional historical parameters in comments.
