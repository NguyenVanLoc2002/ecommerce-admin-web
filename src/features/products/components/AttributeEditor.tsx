import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';

export function AttributeEditor() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });

  return (
    <div className="space-y-2">
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const keyError = (errors.attributes as Record<string, unknown>[] | undefined)?.[index]
              ?.key as { message?: string } | undefined;
            const valueError = (errors.attributes as Record<string, unknown>[] | undefined)?.[
              index
            ]?.value as { message?: string } | undefined;

            return (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    {...register(`attributes.${index}.key`)}
                    placeholder="e.g. Color"
                    error={!!keyError}
                  />
                  {keyError?.message && (
                    <p className="text-xs text-danger-600">{keyError.message}</p>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    {...register(`attributes.${index}.value`)}
                    placeholder="e.g. White"
                    error={!!valueError}
                  />
                  {valueError?.message && (
                    <p className="text-xs text-danger-600">{valueError.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label="Remove attribute"
                  className={cn('mt-0.5 text-gray-400 hover:text-danger-600')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ key: '', value: '' })}
        className="text-primary-600"
      >
        <Plus className="h-4 w-4" />
        Add attribute
      </Button>
    </div>
  );
}
