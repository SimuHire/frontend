import type { TrialDetailViewProps } from './types';
import { LoadingSkeletonBlock } from '@/shared/ui/LoadingSkeletonBlock';
import { ScenarioControlsSectionComponent } from './TrialScenarioControlsComponent';

type TrialDetailScenarioControlsProps = {
  props: TrialDetailViewProps;
  showScenarioControls: boolean;
};

export function TrialDetailScenarioControls({
  props,
  showScenarioControls,
}: TrialDetailScenarioControlsProps) {
  if (!showScenarioControls) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <LoadingSkeletonBlock label="Preparing Trial controls" lines={2} />
      </div>
    );
  }

  return (
    <ScenarioControlsSectionComponent
      versions={props.scenarioVersions}
      selectedVersionId={props.selectedScenarioVersionId}
      onSelectVersion={props.onSelectScenarioVersion}
      selectedVersion={props.selectedScenarioVersion}
      previousVersion={props.previousScenarioVersion}
      lockBannerMessage={props.scenarioLockBannerMessage}
      contentUnavailableMessage={props.scenarioContentUnavailableMessage}
      generatingLabel={props.scenarioGeneratingLabel}
      editorDisabled={props.scenarioEditorDisabled}
      editorDisabledReason={props.scenarioEditorDisabledReason}
      editorSaving={props.scenarioEditorSaving}
      editorSaveError={props.scenarioEditorSaveError}
      editorFieldErrors={props.scenarioEditorFieldErrors}
      editorDraft={props.scenarioEditorDraft}
      onEditorDraftChange={props.onScenarioEditorDraftChange}
      onSave={props.onSaveScenarioEdits}
    />
  );
}
