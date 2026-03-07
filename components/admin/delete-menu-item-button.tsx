'use client';

type DeleteMenuItemButtonProps = {
  itemName: string;
  formAction: (formData: FormData) => void | Promise<void>;
};

export function DeleteMenuItemButton({ itemName, formAction }: DeleteMenuItemButtonProps) {
  return (
    <button
      formAction={formAction}
      formMethod="post"
      type="submit"
      className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
      formNoValidate
      onClick={(event) => {
        if (!confirm(`Delete ${itemName}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
