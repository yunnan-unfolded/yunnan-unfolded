import type { ChangeEvent, ComponentProps, FocusEvent } from "react";
import { useForm } from "react-final-form";
import { ImageField, type TinaField } from "tinacms";

type HomeImageProps = {
  field: TinaField & { namespace: string[] };
  input: {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<string>) => void;
    onBlur: (event?: FocusEvent<string>) => void;
    onFocus: (event?: FocusEvent<string>) => void;
  };
  meta: { error?: unknown };
};

// Both controls use the same Tina final-form field. The path input also
// supports existing assets outside the shared media library root.
export function HomeImageField(props: HomeImageProps) {
  const form = useForm();
  const id = `${props.input.name}-path`;
  const imageProps = { ...props, form, tinaForm: form } as unknown as ComponentProps<typeof ImageField>;
  return (
    <div>
      <ImageField {...imageProps} />
      <label htmlFor={id}>图片路径或 HTTPS 图片地址</label>
      <input
        id={id}
        type="text"
        value={props.input.value ?? ""}
        onChange={event => props.input.onChange(event.currentTarget.value as unknown as ChangeEvent<string>)}
        onBlur={() => props.input.onBlur()}
        onFocus={() => props.input.onFocus()}
        style={{ display: "block", width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
      />
    </div>
  );
}
