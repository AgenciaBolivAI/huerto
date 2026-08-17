'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CustomerType, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export function AccountForm({ profile }: { profile: Profile }) {
  const router = useRouter();

  const [customerType, setCustomerType] = useState<CustomerType>(profile.customer_type);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [lotNumber, setLotNumber] = useState(profile.lot_number);
  const [businessName, setBusinessName] = useState(profile.business_name);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const supabase = createClient();
    const { error: saveError } = await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      lot_number: lotNumber.trim(),
      business_name: businessName.trim(),
      customer_type: customerType,
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const inputCls =
    'w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-900 transition-colors placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600/30';

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-50 p-2">
        <button
          type="button"
          onClick={() => setCustomerType('retail')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            customerType === 'retail' ? 'bg-brand-700 text-crema-50 shadow-soft' : 'text-brand-800 hover:bg-brand-100'
          }`}
        >
          Propietario
        </button>
        <button
          type="button"
          onClick={() => setCustomerType('b2b')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            customerType === 'b2b' ? 'bg-brand-700 text-crema-50 shadow-soft' : 'text-brand-800 hover:bg-brand-100'
          }`}
        >
          Negocio (B2B)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="p-name">
            Nombre completo
          </label>
          <input
            id="p-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="p-phone">
            Teléfono / WhatsApp
          </label>
          <input
            id="p-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="p-email">
          Correo electrónico
        </label>
        <input
          id="p-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          autoComplete="email"
        />
      </div>

      {customerType === 'b2b' && (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="p-business">
            Nombre del negocio
          </label>
          <input
            id="p-business"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={inputCls}
            autoComplete="organization"
          />
        </div>
      )}

      {customerType === 'retail' && (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="p-lot">
            Número de lote
          </label>
          <input
            id="p-lot"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            className={inputCls}
            placeholder="Ej.: Mz. C-12, Lote 34"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="p-address">
          Dirección de entrega
        </label>
        <input
          id="p-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputCls}
          autoComplete="street-address"
          placeholder="Referencia para ubicar tu lote o negocio"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          Datos guardados correctamente.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-crema-50 transition-colors hover:bg-brand-800 disabled:bg-brand-200"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-brand-200 px-5 py-2.5 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
        >
          Cerrar sesión
        </button>
      </div>
    </form>
  );
}
