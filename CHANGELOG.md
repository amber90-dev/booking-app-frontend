# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Added a "Completed" tab to the bookings list and updated logic to automatically flag past bookings as "Completed" rather than "Active".
- Fixed a bug in the Client Schedule report where selecting a specific client caused the results to incorrectly show "No records found". Added a fallback to match records by client name when the strict internal ID is missing or mismatched on the booking record.
