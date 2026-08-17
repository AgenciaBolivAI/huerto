import { CheckoutForm } from './checkout-form';

export const metadata = {
  title: 'Confirmar pedido',
  description:
    'Completa tus datos y confirma tu pedido de plantines. No pagas ahora: coordinamos el pago y la entrega por WhatsApp.',
  alternates: { canonical: '/pedido' },
  robots: { index: false, follow: true },
};

export default function PedidoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="eyebrow text-tierra-600">Último paso</p>
      <span className="rule-grow mt-4" />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-brand-900 sm:text-5xl">
        Confirmar pedido
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-800/75">
        Elige el tipo de compra: propietario de Prados del Sur (minorista) o cuenta de negocio
        (B2B) con precios mayoristas. No pagas ahora — coordinamos por WhatsApp.
      </p>
      <CheckoutForm />
    </div>
  );
}
