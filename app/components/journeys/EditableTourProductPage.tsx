"use client";

import { tinaField, useTina } from "tinacms/dist/react";
import type { JourneyQuery, JourneyQueryVariables } from "../../../tina/__generated__/types";
import { journeyContentToViewModel } from "../../lib/journeyAdapter";
import type { JourneyContent } from "../../types/journey";
import { TourProductPage } from "./TourProductPage";

type TinaJourneyPayload = {
  data: JourneyQuery;
  query: string;
  variables: JourneyQueryVariables;
};

export function EditableTourProductPage({ payload }: { payload: TinaJourneyPayload }) {
  const { data } = useTina(payload);
  const content = data.journey as unknown as JourneyContent;
  return (
    <TourProductPage
      editFields={{ title: tinaField(data.journey, "title") }}
      journey={journeyContentToViewModel(content)}
    />
  );
}
