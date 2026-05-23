jest.mock('@/features/candidate/tasks/components/Day1MarkdownEditor', () => ({
  Day1MarkdownEditor: ({
    value,
    onChange,
    disabled,
    placeholder,
    onBlurDocument,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    onBlurDocument?: () => void;
    editorKey: string;
  }) => (
    <textarea
      aria-label="markdown editor"
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlurDocument}
    />
  ),
}));
