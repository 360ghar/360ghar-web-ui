import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '@/lib/api/errors';
import { MOBILE_RE } from '@/lib/phone';
import { PropertyCardSkeleton } from '@/features/property/PropertyCardView';
import { Icon } from '@/ui/icons/Icon';
import { Delayed } from '@/ui/react/Delayed';
import { Check, SelectField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { Sheet } from '@/ui/react/Sheet';
import { Tabs } from '@/ui/react/Tabs';
import { Toaster, toast } from '@/ui/react/Toaster';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name (2 letters or more).'),
  phone: z.string().regex(MOBILE_RE, 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.'),
  purpose: z.enum(['buy', 'rent'], { message: 'Select buy or rent.' }),
  terms: z.literal(true, { message: 'Accept the terms to continue.' }),
});
type Form = z.infer<typeof schema>;

function Thrower({ kind }: { kind: 'network' | 'server' }): never {
  throw kind === 'network'
    ? new ApiError({ status: 0, code: 'NETWORK', message: 'Failed to fetch' })
    : new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'boom' });
}

const BHK = ['1', '2', '3', '4+'];

export default function StyleguideDemo() {
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [bhk, setBhk] = useState<string[]>(['2']);
  const [tab, setTab] = useState('photos');
  const [crash, setCrash] = useState<'network' | 'server' | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: '', phone: '' } });

  const onSubmit = handleSubmit(async (data) => {
    await new Promise((r) => setTimeout(r, 400));
    // Simulate a 422 from the backend for one number, to show server errors on fields.
    if (data.phone === '9999999999') {
      setError('phone', { message: 'This number is already registered. Sign in instead.' });
      return;
    }
    toast('Saved. We will call you back.', 'success');
  });

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ink" onClick={() => setSheet(true)}>
          <Icon name="filter" size={18} /> Open filters
        </button>
        <button type="button" className="btn" onClick={() => setDialog(true)}>
          Open dialog
        </button>
        <button type="button" className="btn" onClick={() => toast('Saved to your shortlist.', 'success', { label: 'Undo', run: () => toast('Removed from your shortlist.') })}>
          Show toast
        </button>
        <button type="button" className="btn" onClick={() => toast('Could not save. Check your connection.', 'error')}>
          Show error toast
        </button>
      </div>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filters"
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setBhk([])}>
              Clear
            </button>
            <button type="button" className="btn btn-primary grow" onClick={() => setSheet(false)}>
              Show 24 homes
            </button>
          </>
        }
      >
        <fieldset className="grid gap-3">
          <legend className="field-label mb-2">Bedrooms</legend>
          <div className="flex flex-wrap gap-2">
            {BHK.map((b) => (
              <button
                key={b}
                type="button"
                className="toggle"
                aria-pressed={bhk.includes(b)}
                onClick={() => setBhk((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]))}
              >
                {b} BHK
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 grid gap-4">
          <SelectField label="Sort by" defaultValue="newest">
            <option value="newest">Newest first</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Min budget" inputMode="numeric" placeholder="₹ 20,000" />
            <TextField label="Max budget" inputMode="numeric" placeholder="₹ 60,000" />
          </div>
          <Check label="Only homes with a 360° tour" />
          <Check label="Ready to move" />
        </div>
      </Sheet>

      <Sheet open={dialog} onClose={() => setDialog(false)} title="Remove this listing?" variant="dialog">
        <p className="text-ink-800">The listing goes offline now. You can post it again later.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn btn-quiet" onClick={() => setDialog(false)}>
            Keep it
          </button>
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              setDialog(false);
              toast('Listing removed.');
            }}
          >
            <Icon name="trash" size={18} /> Remove
          </button>
        </div>
      </Sheet>

      <section className="grid gap-4">
        <h3 className="text-xl">Tabs</h3>
        <Tabs
          label="Property media"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'photos', label: 'Photos (12)', panel: <p className="text-ink-800">The gallery shows here.</p> },
            { id: 'tour', label: '360° tour', panel: <p className="text-ink-800">The virtual tour loads when you open it.</p> },
            { id: 'plan', label: 'Floor plan', panel: <p className="text-ink-800">The floor plan image shows here.</p> },
          ]}
        />
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl">Form with field errors</h3>
        <p className="text-sm text-ink-600">Submit empty to see client errors. Use 9999999999 to see a server error on the field.</p>
        <form onSubmit={onSubmit} noValidate className="grid max-w-md gap-4">
          <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <TextField
            label="Mobile number"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            hint="We send an OTP to this number."
            error={errors.phone?.message}
            {...register('phone')}
          />
          <SelectField label="I want to" error={errors.purpose?.message} defaultValue="" {...register('purpose')}>
            <option value="" disabled>
              Select
            </option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </SelectField>
          <div>
            <Check label="I accept the terms of service" {...register('terms')} />
            {errors.terms ? (
              <p className="field-error">
                <Icon name="alert" size={16} />
                {errors.terms.message}
              </p>
            ) : null}
          </div>
          <button type="submit" className="btn btn-primary justify-self-start" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Request a callback'}
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl">Island error boundary</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={() => setCrash('network')}>
            Break with a network error
          </button>
          <button type="button" className="btn" onClick={() => setCrash('server')}>
            Break with a server error
          </button>
          <button type="button" className="btn" onClick={() => setLoading((v) => !v)}>
            {loading ? 'Stop loading' : 'Start loading'}
          </button>
        </div>
        <div className="sheet p-4">
          <IslandBoundary compact onReset={() => setCrash(null)}>
            {crash ? <Thrower kind={crash} /> : null}
            {loading ? (
              <Delayed>
                <div className="skeleton-gate grid gap-6 sm:grid-cols-2">
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                </div>
              </Delayed>
            ) : (
              <p className="text-ink-800">This island works. Break it to see the error state and "Try again".</p>
            )}
          </IslandBoundary>
        </div>
      </section>

      <Toaster />
    </div>
  );
}
