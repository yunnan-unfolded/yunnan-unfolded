type NavigationState = {
  hasValidationErrors?: boolean;
  validating?: boolean;
  submitError?: unknown;
  submitErrors?: Record<string, unknown>;
};

// A failed beforeSubmit becomes Final Form's global submitError. It must
// remain visible to Save, but must not prevent entering fields to correct it.
export function canCorrectTravelGuideSubmission(state: NavigationState) {
  return Boolean(state.submitError)
    && state.hasValidationErrors === false
    && state.validating === false
    && Object.values(state.submitErrors ?? {}).every((error) => (
      error === undefined || error === null || error === false || error === state.submitError
    ));
}
