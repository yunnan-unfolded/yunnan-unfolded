import { useCallback, type ChangeEvent, type FocusEvent } from "react";
import { useForm } from "react-final-form";
import { ImageField, type TinaField } from "tinacms";

type ImageFieldProps = {
  input: {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<string>) => void;
    onBlur: (event?: FocusEvent<string>) => void;
    onFocus: (event?: FocusEvent<string>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown };
};

function siblingPath(name: string, sibling: string) {
  const parts = name.split(".");
  parts[parts.length - 1] = sibling;
  return parts.join(".");
}

export function JourneyImageField(props: ImageFieldProps) {
  const { input } = props;
  const form = useForm();
  const onChange = useCallback((event: ChangeEvent<string> | string) => {
    const target = typeof event === "string" ? undefined : (event as unknown as { target?: { value?: string } }).target;
    const value = typeof event === "string" ? event : String(target?.value || "");
    input.onChange(value as unknown as ChangeEvent<string>);
    if (!value || typeof window === "undefined") return;

    const image = new window.Image();
    image.onload = () => {
      form.change(siblingPath(input.name, "width"), image.naturalWidth);
      form.change(siblingPath(input.name, "height"), image.naturalHeight);
      form.change(siblingPath(input.name, "legacyAspect"), undefined);
      form.change(
        siblingPath(input.name, "displayRatio"),
        image.naturalHeight > image.naturalWidth ? "portrait" : "landscape",
      );
    };
    image.src = value;
  }, [form, input]);

  const imageProps = { ...props, form, tinaForm: form, input: { ...input, onChange } } as unknown as Parameters<typeof ImageField>[0];
  return <ImageField {...imageProps} />;
}
