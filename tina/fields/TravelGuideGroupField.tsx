import type { ComponentProps } from "react";
import { GroupFieldPlugin, useCMS, type TinaField } from "tinacms";
import { canCorrectTravelGuideSubmission } from "../travelGuideNavigation";

function TravelGuideGroupField(props: ComponentProps<typeof GroupFieldPlugin.Component>) {
  const cms = useCMS();
  const NativeGroup = GroupFieldPlugin.Component;
  return <div onClickCapture={(event) => {
    // Read the exact instance passed to native Group. Do not clear errors,
    // resubmit, or change values just to allow correcting a failed save.
    const state = props.tinaForm.finalForm.getState();
    if (!canCorrectTravelGuideSubmission(state)) return;
    event.stopPropagation();
    cms.dispatch({ type: "forms:set-active-field-name", value: {
      formId: props.tinaForm.id, fieldName: props.field.name,
    } });
  }}><NativeGroup {...props} /></div>;
}

export function withTravelGuideNavigation(fields: TinaField[]): TinaField[] {
  return fields.map((field) => field.type === "object" && !field.list && !field.ui?.component
    ? { ...field, ui: { ...field.ui, component: TravelGuideGroupField as never } } as TinaField
    : field);
}
