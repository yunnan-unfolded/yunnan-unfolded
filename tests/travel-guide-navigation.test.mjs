import assert from "node:assert/strict";
import test from "node:test";
import { prepareTravelGuideForSave } from "../tina/travelGuideSave.ts";
import { TRAVEL_GUIDE_DEFAULT_ITEM } from "../shared/travelGuideDefaults.ts";

test("a failed Chinese-title save can be corrected through groups without bypassing field validation", async () => {
  const { createRequire } = await import("node:module");
  const { realpathSync } = await import("node:fs");
  const { canCorrectTravelGuideSubmission } = await import("../tina/travelGuideNavigation.ts");
  const require = createRequire(import.meta.url);
  const tinaRequire = createRequire(realpathSync(require.resolve("tinacms")));
  const { createForm, FORM_ERROR } = tinaRequire("final-form");
  const values = { ...TRAVEL_GUIDE_DEFAULT_ITEM, title: "云南旅游管理", filename: "new-guide" };
  const form = createForm({ initialValues: values, onSubmit: async (current) => {
    try { await prepareTravelGuideForSave({ values: current, cms: {}, form: { crudType: "create" } }); }
    catch (error) { return { [FORM_ERROR]: error }; }
  } });
  const unsubscribe = form.registerField("title", () => {}, { value: true });
  await form.submit();
  const failed = form.getState();
  assert.equal(failed.invalid, true);
  assert.equal(failed.hasValidationErrors, false);
  assert.match(failed.submitError.message, /页面网址无效/);
  assert.equal(canCorrectTravelGuideSubmission(failed), true);
  assert.equal(canCorrectTravelGuideSubmission({ ...failed, hasValidationErrors: true }), false);
  assert.equal(canCorrectTravelGuideSubmission({ ...failed, validating: true }), false);
  assert.equal(canCorrectTravelGuideSubmission({ ...failed, submitErrors: { ...failed.submitErrors, title: "Required" } }), false);
  assert.equal(form.getState().submitError, failed.submitError);
  form.change("basic.slug", "yunnan-travel-guide");
  await form.submit();
  assert.equal(form.getState().invalid, false);
  assert.equal(form.getState().values.title, "云南旅游管理");
  unsubscribe();
});
