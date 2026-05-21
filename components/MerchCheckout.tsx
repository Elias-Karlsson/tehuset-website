 'use client';
import { useState } from 'react';
import type { Lang, Product } from './types';

export function MerchCheckout({ lang, products }: { lang: Lang; products: Product[] }) {
  const product = products.find((item) => item.active) ?? products[0];
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!product) return null;

  async function submit() {
    setStatus('loading');
    setMessage('');
    const response = await fetch('/api/swish/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity, payerAlias: phone, customerEmail: email, lang }),
    });
    const data = await response.json();
    setStatus(response.ok ? 'success' : 'error');
    setMessage(data.message ?? (response.ok ? 'OK' : 'Error'));
  }

  return (
    <div className="merch-card">
      <img src={product.image} alt={product.name[lang]} loading="lazy" />
      <div>
        <h3>{product.name[lang]}</h3>
        <p>{product.description[lang]}</p>
        <p className="price">{product.priceSek} SEK</p>
        <label>
          {lang === 'sv' ? 'Antal' : 'Quantity'}
          <input type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        </label>
        <label>
          {lang === 'sv' ? 'Swish-nummer' : 'Swish phone number'}
          <input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="4670..." />
        </label>
        <label>
          {lang === 'sv' ? 'E-post för kvitto' : 'Email for confirmation'}
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
        </label>
        <button className="brush-button" type="button" disabled={status === 'loading'} onClick={submit}>
          {status === 'loading' ? (lang === 'sv' ? 'Skapar betalning…' : 'Creating payment…') : lang === 'sv' ? 'Betala med Swish' : 'Pay with Swish'}
        </button>
        {message ? <p className={`checkout-message checkout-message--${status}`}>{message}</p> : null}
      </div>
    </div>
  );
}
